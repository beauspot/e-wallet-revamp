import fs from "fs";
import path from "path";
import pino from "pino";
import dayjs from "dayjs";

const logDir = path.resolve(__dirname, "../../../../logs");

// Ensure log directory exists in production
if (process.env.NODE_ENV === "production") {
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true, mode: 0o755 });
    }
  } catch (err) {
    console.error(`Error creating log directory: ${err}`);
    process.exit(1);
  }

  // Ensure write permission
  try {
    fs.accessSync(logDir, fs.constants.W_OK);
  } catch (error) {
    console.error(`No write permissions for log directory: ${logDir}`);
    process.exit(1);
  }
}

// Set up streams based on environment
let streams;
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  // Development/Test: logs to terminal
  streams = [
    {
      level: "trace", // Capture all log levels
      stream: pino.transport({
        target: "pino-pretty",
        options: { colorize: true },
      }),
    },
  ];
} else {
  // Production: logs to files
  streams = [
    { level: "info", stream: pino.destination(path.join(logDir, "info.log")) },
    { level: "error", stream: pino.destination(path.join(logDir, "error.log")) },
    { level: "debug", stream: pino.destination(path.join(logDir, "debug.log")) },
    { level: "warn", stream: pino.destination(path.join(logDir, "warn.log")) },
    { level: "fatal", stream: pino.destination(path.join(logDir, "fatal.log")) },
    { level: "trace", stream: pino.destination(path.join(logDir, "trace.log")) },
  ];
}

// Initialize the logger
const logging = pino(
  {
    level: "trace", // Capture all log levels
    base: { pid: false },
    timestamp: () => `,"time":"${dayjs().format()}"`,
  },
  pino.multistream(streams) // Use pino.multistream for handling multiple streams
);

/** Create the global definition */
declare global {
  var log: pino.Logger;
}

/** Link the global logger correctly */
global.log = logging;

// ** Test Logging **
logging.info(`Logger initialized - Environment: ${process.env.NODE_ENV}`);
logging.error("Logger initialized - Error level");

export default logging;
