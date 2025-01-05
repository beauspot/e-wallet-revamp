import {
    Worker,
    Queue,
    Job,
    QueueEvents,
    ConnectionOptions
} from "bullmq";

import { UserTransactionModel } from "@/db/transactions.entity";
import redisModule from "@/configs/redis.config";
import QueueServices from "@/queues/email.queues";
import { Flw } from "@/integrations/flutterwave";
import { virtualAccountPayload as VANPayload } from "@/interfaces/flutterwave.interface";

const { redisClient } = redisModule;
const { workerOptions } = QueueServices;

let connection: ConnectionOptions = redisClient;

// create the virtual account number queue
const CreateVirtualAccountQueue = new Queue<VANPayload>("FLW-queues", {
    connection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 1000, // retry after 1sec
        }
    }
});

const addVANToQueue = async (opt: VANPayload): Promise<void> => {
    try {
        await CreateVirtualAccountQueue.add(opt.bvn, opt, {
            priority: 2, // Priority level for the job
        });
        log.info(`VAN job added to the queue: ${opt.firstName}`);
    } catch (error: unknown) {
        log.error('Error adding email job:', error);
        throw error;
    }
};

const processVANJob = async (job: Job<VANPayload>): Promise<void> => {
    const {
        email,
        bvn,
        tx_ref,
        is_permanent,
        firstName,
        lastName,
        phoneNumber,
        narration } = job.data;

    try {
        const flutterwave = new Flw(
            process.env.FLUTTERWAVE_PUBLIC_KEY,
            process.env.FLUTTERWAVE_SECRET_KEY,
            process.env.FLUTTERWAVE_ENCRYPTION_KEY,
            UserTransactionModel,
        );

        const payload: VANPayload = {
            email,
            bvn,
            tx_ref,
            is_permanent,
            firstName,
            lastName,
            phoneNumber,
            narration,
        };
        await flutterwave.createVAN(payload)
    } catch (error: unknown) {
        log.error(`Error in creating VAN: ${error}`)
        throw error
    }
};

// Create worker to process the VAN jobs.
const vanWorker = new Worker<VANPayload>("FLW-queues", async (job: Job<VANPayload>) => await processVANJob(job), workerOptions);

// Handle worker Events NB - This is optional
const vanQueueEvents = new QueueEvents("email-queues", {
    connection
});

vanQueueEvents.on("completed", (jobId) => {
    log.info(`Job completed successfully: ${jobId}`);
});

vanQueueEvents.on("failed", (jobId, failedReson) => {
    log.error(`Job failed: ${jobId}, Reason: ${failedReson}`);
});

// listening to completed or failed jobs by attaching listeners to the workers
vanWorker.on("completed", (job: Job) => console.info(`Job ${job.id} completed successfully`));
vanWorker.on("failed", (job, err) => console.error(`Job ${job!.id} failed with error: ${err.message}`));

vanWorker.on("ready", () => {
    console.info("Worker is ready and connected to Bull/Redis.");
});

vanWorker.on("stalled", (jobId) => {
    console.warn(`Job ${jobId} has stalled and will be retried.`);
});

vanWorker.on("error", (err) => {
    console.error(`Worker encountered an error: ${err.message}`);
});

export default {
    addVANToQueue,
    vanWorker,
}