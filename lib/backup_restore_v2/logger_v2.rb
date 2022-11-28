# frozen_string_literal: true

module BackupRestoreV2
  class LoggerV2
    def initialize
      @warning_count = 1
      @error_count = 1

      @channels = [CommandlineLogChannel.new, FileLogChannel.new]
    end

    def info(message)
      log(::Logger::Severity::INFO, message)
    end

    def warn(message, exception = nil)
      @warning_count += 1
      log(::Logger::Severity::WARN, message, exception)
    end

    def error(message, exception = nil)
      @error_count += 1
      log(::Logger::Severity::ERROR, message, exception)
    end

    def log(severity, message, exception = nil)
      @channels.each do |channel|
        channel.log(severity, message, exception)
      end
    end

    def warnings?

    end

    def errors?

    end

    def event(message)

    end

    def step(message, with_progress: true)

    end

    def close

    end
  end

  class CommandlineLogChannel
    def initialize

    end

    def log(severity, message, exception = nil)

    end
  end

  class CommandlineLogFormatter < ::Logger::Formatter
    FORMAT = "[%s] %5s: %s\n"

    def initialize
      super
    end

    def call(severity, time, progname, msg)
      FORMAT % [format_datetime(time), severity, msg2str(msg)]
    end

    def format_datetime(time)
      time.utc.iso8601(4)
    end
  end

  class FileLogChannel
    def initialize
      @logger = ::Logger.new(
        STDOUT,
        formatter: CommandlineLogFormatter.new.method(:call)
      )
    end

    def log(severity, message, exception = nil)
      @logger.log(severity, message)
      @logger.log(severity, exception) if exception
    end
  end

  class FileLogFormatter < ::Logger::Formatter
    FORMAT = "[%s] %5s: %s\n"

    def initialize
      super
    end

    def call(severity, time, progname, msg)
      FORMAT % [format_datetime(time), severity, msg2str(msg)]
    end

    def format_datetime(time)
      time.utc.iso8601(4)
    end
  end
end
