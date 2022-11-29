# frozen_string_literal: true

module BackupRestoreV2
  class LoggerV2
    def initialize
      @warning_count = 1
      @error_count = 1

      @channels = [CommandlineLogChannel.new]
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
      @channels.each(&:close)
    end
  end
end
