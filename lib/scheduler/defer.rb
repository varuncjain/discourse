# frozen_string_literal: true
require "weakref"

module Scheduler
  module Deferrable
    DEFAULT_TIMEOUT ||= 90
    STATS_CACHE_SIZE ||= 100

    def initialize
      @async = !Rails.env.test?
      @queue = Queue.new
      @mutex = Mutex.new
      @stats_mutex = Mutex.new
      @paused = false
      @thread = nil
      @reactor = nil
      @timeout = DEFAULT_TIMEOUT
      @stats = LruRedux::ThreadSafeCache.new(STATS_CACHE_SIZE)
    end

    def timeout=(t)
      @mutex.synchronize { @timeout = t }
    end

    def length
      @queue.length
    end

    def stats
      @stats_mutex.synchronize { @stats.to_a }
    end

    def pause
      stop!
      @paused = true
    end

    def resume
      @paused = false
    end

    # for test and sidekiq
    def async=(val)
      @async = val
    end

    def later(desc = nil, db = RailsMultisite::ConnectionManagement.current_db, &blk)
      @stats_mutex.synchronize do
        stats = (@stats[desc] ||= { queued: 0, finished: 0, duration: 0, errors: 0 })
        stats[:queued] += 1
      end

      if @async
        start_thread if !@thread&.alive? && !@paused
        @queue << [db, blk, desc]
      else
        blk.call
      end
    end

    def stop!
      @thread.kill if @thread&.alive?
      @thread = nil
      @reactor&.stop
      @reactor = nil
    end

    # test only
    def stopped?
      !@thread&.alive?
    end

    def do_all_work
      do_work(_non_block = true) while !@queue.empty?
    end

    private

    def start_thread
      @mutex.synchronize do
        @reactor = MessageBus::TimerThread.new if !@reactor
        @thread = Thread.new { do_work while true } if !@thread&.alive?
      end
    end

    # using non_block to match Ruby #deq
    def do_work(non_block = false)
      db, job, desc = @queue.deq(non_block)
      start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      db ||= RailsMultisite::ConnectionManagement::DEFAULT

      RailsMultisite::ConnectionManagement.with_connection(db) do
        begin
          warning_job =
            @reactor.queue(@timeout) do
              Rails.logger.error "'#{desc}' is still running after #{@timeout} seconds on db #{db}, this process may need to be restarted!"
            end if !non_block
          job.call
        rescue => ex
          @stats_mutex.synchronize do
            stats = @stats[desc]
            stats[:errors] += 1 if stats
          end
          Discourse.handle_job_exception(ex, message: "Running deferred code '#{desc}'")
        ensure
          warning_job&.cancel
        end
      end
    rescue => ex
      Discourse.handle_job_exception(ex, message: "Processing deferred code queue")
    ensure
      ActiveRecord::Base.connection_handler.clear_active_connections!
      @stats_mutex.synchronize do
        stats = @stats[desc]
        if stats
          stats[:finished] += 1
          stats[:duration] += Process.clock_gettime(Process::CLOCK_MONOTONIC) - start
        end
      end
    end
  end

  class Defer
    extend Deferrable
    initialize
  end
end
