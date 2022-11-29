# frozen_string_literal: true

module BackupRestoreV2
  class LoggerV2
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
  end
end
