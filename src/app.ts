import express, { Express, Response } from "express";
import rateLimit from "express-rate-limit";
// import swaggerUi from "swagger-ui-express";
import session from "express-session";

import cors from "cors";
// import path from "path";
// import YAML from "yamljs";
import helmet, { HelmetOptions } from "helmet";

import redisModule from "@/configs/redis.config";
import __404_err_page from "@/middlewares/__404_notfound";
import globalErrorHandler from "@/middlewares/errHandler";
import { logging_middleware } from "@/middlewares/loggingmiddleware";
import authRouter from "@/routes/user.routes";
import walletRouter from "@/routes/wallet.routes";
import cookieParser from "cookie-parser";

// Redis
const { redisStore } = redisModule;

// Configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

const helmetConfig: HelmetOptions = {
  frameguard: { action: "deny" },
  xssFilter: true,
  referrerPolicy: { policy: "same-origin" },
  hsts: { maxAge: 15552000, includeSubDomains: true, preload: true }
};

function createAppServer(): Express {
  log.info("----------------------------------------");
  log.info("Setting up middlewares...");
  log.info("----------------------------------------");

  const app = express();

  app.set("trust proxy", 10);
  app.use(cors({ origin: "*", credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(helmet(helmetConfig));
  app.use(helmet.hidePoweredBy());
  app.use(helmet.noSniff());
  app.use(helmet.ieNoOpen());
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(cookieParser());
  app.use(limiter);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "default_fallback_secret",
      resave: false,
      saveUninitialized: true,
      store: redisStore,
      cookie: {
        maxAge: 30 * 60 * 1000, // 30mins
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict"
      }
    })
  );

  if (process.env.NODE_ENV === "development") {
    app.use(logging_middleware);
  }

  log.info("Setting up routes...");

  app.get("/", (_, res: Response) => {
    // eslint-disable-next-line quotes
    res.send('<h1>E-Wallet API Documentation</h1><a href="/api-docs">Documentation</a>');
  });

  app.use("/auth", authRouter);
  app.use("/wallet", walletRouter);

  app.all("*", __404_err_page);

  app.use(globalErrorHandler);

  return app;
}

export default createAppServer;
