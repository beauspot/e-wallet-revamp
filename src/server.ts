import "reflect-metadata";
import log from "@/utils/logging";

import dotenv from "dotenv";
import ip from "ip";

import createApp  from "@/app";
import { db_init } from "@/configs/db.config";
import redisModule from "@/configs/redis.config";

dotenv.config();

const port = Number(process.env.SERVER_PORT) || 3000;
const applicationMessage = "Application is running on:";
const { redisClient, shutdownClient } = redisModule;

async function startServer(): Promise<void> {
    try {
        await db_init();
        const app = createApp();

        app.listen(port, () => {
            log.info("----------------------------------------");
            log.info("API Initialized");
            log.info(`Documentation with Swagger : ${ip.address()}:${port}/api-docs`);
            log.info("----------------------------------------");
            log.info(`${applicationMessage} ${ip.address()}:${port}`);
            log.info("----------------------------------------");
        });
    } catch (error) {
        log.error("Database connection error: " + error);
    }
};

// Gracefully Shutdown (Redis client when the application stops)
process.on('SIGINT', async () => {
    log.info("----------------------------------------");
    log.info('Shutting down application server...');
    log.info("----------------------------------------");
    try {
        log.info("----------------------------------------");
        log.info('Shutting down redis Client...');
        await shutdownClient(redisClient);
        log.info("Redis Client closed successfully.");
        log.info("----------------------------------------");
    } catch (error: any) {
        log.info("----------------------------------------");
        log.error(`Error Shutting down Redis client: ${error.message}`)
        log.info("----------------------------------------");
    } finally {
        log.info("----------------------------------------");
        log.info("Application server shut down gracefully.");
        log.info("----------------------------------------");
        process.exit(0);
    }
});


startServer();