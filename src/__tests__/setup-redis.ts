import redisModule from "@/configs/redis.config";
import walletQueues from "@/queues/wallet.queues";

const { redisClient, shutdownClient } = redisModule;
const { createVirtualAccountWorker, vanQueueEvents} = walletQueues;

afterAll(async () => {
    await shutdownClient(redisClient);
    log.info("Redis client closed.")
});

afterAll(async () => {
    await Promise.all([
        createVirtualAccountWorker.close(),
        vanQueueEvents.close()
    ]);

    log.info("BullMQ connection closed.")
})