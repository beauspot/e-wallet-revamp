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
});

// Cache helper function 
const CacheData = async (key: string, ttl: number, fetchData: () => Promise<any>) => {
    try {
        // Check Redis for cached data
        const cachedData = await redisClient.get(key);

        if (cachedData) {
            log.info(`Cache hit for key: ${key}`);
            // return parsed cached data

            // return JSON.parse(cachedData)
            return JSON.parse(cachedData.toString()); 
        }

        // Fetch new data if not cached 
        log.info(`Cache miss for key: ${key}. Fetching new data...`);
        const data = await fetchData();

        // Cache the new Data with ttl (time-to-live)
        await redisClient.setex(key, ttl, JSON.stringify(data));
        log.info(`Data cahced for key: ${key} with TTL: ${ttl} seconds.`);

        return data;
    } catch (err: unknown) {
        log.error(`Error Handling cache for key: ${key}. Message: ${err}`);
        throw err;
    }
}

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
    CacheData,
    shutdownClient,
}