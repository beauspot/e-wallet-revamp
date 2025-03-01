import redisModule from "@/configs/redis.config";
import walletQueues from "@/queues/wallet.queues";
import emailQueues from "@/queues/email.queues";

const { redisClient, shutdownClient } = redisModule;
const {  walletWorker, vanQueueEvents } = walletQueues;
const { SendMailWorker, mailQueueEvents } = emailQueues;

afterAll(async () => {
    await shutdownClient(redisClient);
    log.info("Redis client closed.")
});

afterAll(async () => {
    await Promise.all([
        walletWorker.close(),
        vanQueueEvents.close(),
        SendMailWorker.close(),
        mailQueueEvents.close()
    ]);

    log.info("BullMQ connection closed.")
})