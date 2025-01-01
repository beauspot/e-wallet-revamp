import Redis from "ioredis";
import { RedisStore } from "connect-redis";
import log from "@/utils/logging";

const redisClient = new Redis({
    host: process.env.REDIS_URL_HOST,
    port: process.env.REDIS_URL_PORT ? parseInt(process.env.REDIS_URL_PORT, 10) : undefined,
    db: 4
});

const redisStore = new RedisStore({
    client: redisClient,
    prefix: "sess:",
    ttl: 86400,
    disableTouch: false,
    serializer: {
        stringify: JSON.stringify,
        parse: JSON.parse,
    },
})

const shutdownClient = async (redisClient: Redis) => {
    try {
        await new Promise((resolve) => {
            log.info("----------------------------------------");
            log.info("closing redis client");
            redisClient.quit();
            redisClient.on('end', resolve);
            log.info("----------------------------------------");
        })
    } catch (error: any) {
        log.error(`Error Shutting down Redis Server: ${error.message}`)
    }
}

// Redis client event
// Connect to redis & log success
redisClient.on('connect', () => {
    log.info("----------------------------------------");
    log.info("Successfully connected to a Redis Server");
    log.info("----------------------------------------");
});

// Handle Errors
redisClient.on('error', (err: Error) => {
    log.info("----------------------------------------");
    log.error(`Error connecting to a Redis Server: ${err.message}`)
    log.info("----------------------------------------");
});

export default {
    redisClient,
    redisStore,
    shutdownClient
}