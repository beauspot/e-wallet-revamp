import redisModule from "@/configs/redis.config";

const { redisClient, shutdownClient } = redisModule;

afterAll(async () => {
    await shutdownClient(redisClient);
    log.info("Redis client closed.")
})