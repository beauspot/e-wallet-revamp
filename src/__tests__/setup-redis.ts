import redisModule from "@/configs/redis.config";
import emailQueues from "@/queues/email.queues";
import walletQueues from "@/queues/wallet.queues";

const { redisClient, shutdownClient } = redisModule;
const { walletWorker, vanQueueEvents } = walletQueues;
const { SendMailWorker, mailQueueEvents } = emailQueues;

afterAll(async () => {
  await shutdownClient(redisClient);
  log.info("Redis client closed.");
});

afterAll(async () => {
  await Promise.all([
    walletWorker.close(),
    vanQueueEvents.close(),
    SendMailWorker.close(),
    mailQueueEvents.close()
  ]);

  log.info("BullMQ connection closed.");
});
