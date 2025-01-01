import pino from "pino";
import dayjs from "dayjs";

const logging = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

/** Create the global definition */
declare global {
  var log: pino.Logger;
}

/** Link the local variable to the global variable */
global.log = logging;

export default logging;