import {
    Worker,
    Queue,
    Job,
    QueueEvents,
    WorkerOptions,
    ConnectionOptions
} from "bullmq"

import redisModule from "@/configs/redis.config";
import { EmailJobData } from "@/interfaces/email.interface";
import MailClient from "@/integrations/email"

const { redisClient } = redisModule;
const { sendEmail } = MailClient;

let connection: ConnectionOptions = redisClient;
if (!connection) log.info('Connected to queue redis server');

// create the mailing queue
const emailQueue = new Queue<EmailJobData>("emailQueue", {
    connection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 1000, // retry after 1sec
        }
    }
});

const addMailToQueue = async (email: EmailJobData): Promise<void> => {
    const { type, data } = email;
    try {
        await emailQueue.add(type, email, {
            ...(data.priority !== "high" && { priority: 1}),
        })
    } catch (error: unknown) {
        log.error('Error adding email job:', error);
        throw error;
    }
};

const workerOptions: WorkerOptions = {
    connection: redisClient,
    limiter: {
        max: 1,
        duration: 1000
    }, // Processes an email every second
    lockDuration: 5000, // 5 seconds to process the job so it can't be picked up by another worker
    removeOnComplete: {
        age: 3600, // save up to an hour 
        count: 1000, // save up to 1000 jobs
    },
    removeOnFail: {
        age: 24 * 3600, // Keep failed jobs up to 24hrs
    },
    concurrency: 6, // process 6 jobs concurrently
};

const SendMailWorker = new Worker<EmailJobData>(
    'emailQueue',
    async (job: Job<EmailJobData>) => { 
    const { type, data } = job.data;
        try {
        log.info(`Processing email job: ${type} for ${data.to}`);
        await sendEmail(job.data);
            log.info(`Email sent successfully: ${type} for ${data.to}`);
    } catch (error: unknown) {
        log.error(`Error sending email for job ${job.id}:`, error);
        throw error;
    }
    },
    workerOptions
)

// Handle worker Events NB - This is optional
const mailQueueEvents = new QueueEvents("emailQueue", {
    connection
});

mailQueueEvents.on("completed", (jobId) => {
    log.info(`Job completed successfully: ${jobId}`);
});

mailQueueEvents.on("failed", (jobId, failedReson) => {
    log.error(`Job failed: ${jobId}, Reason: ${failedReson}`);
});

// listening to completed or failed jobs by attaching listeners to the workers
SendMailWorker.on("completed", (job: Job) => console.info(`Job ${job.id} completed successfully`));
// mailWorker.on("failed", (job, err) => console.error(`Job ${job!.id} failed with error: ${err.message}`));

SendMailWorker.on("ready", () => {
    console.info("Worker is ready and connected to Bull/Redis.");
});

SendMailWorker.on("stalled", (jobId) => {
    console.warn(`Job ${jobId} has stalled and will be retried.`);
});

SendMailWorker.on("error", (err) => {
    console.error(`Worker encountered an error: ${err.message}`);
});

export default {
    addMailToQueue,
    SendMailWorker,
    workerOptions,
    mailQueueEvents
}