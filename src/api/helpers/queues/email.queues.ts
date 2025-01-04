import {
    Worker,
    Queue,
    Job,
    QueueEvents,
    WorkerOptions,
    ConnectionOptions
} from "bullmq"

import redisModule from "@/configs/redis.config";
import { EmailService } from "@/integrations/email";
import { Email } from '@/interfaces/email.interface';

const { redisClient } = redisModule;

let connection: ConnectionOptions = redisClient;

// create the mailing queue
const emailQueue = new Queue<Email>("email-queues", {
    connection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 1000, // retry after 1sec
        }
    }
});

const addMailToQueue = async (email: Email): Promise<void> => {
    try {
        await emailQueue.add(email.subject, email, {
            priority: 2, // Priority level for the job
        });
        log.info(`Email job added to the queue: ${email.subject}`);
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

// Function to process email jobs
const processMailJob = async (job: Job<Email>): Promise<void> => {
    const { from, to, subject, text } = job.data;

    try {
        const mailService = new EmailService({ email: to, firstName: "" }, "", "");

        // Send the mail using the email Service
        await mailService.send(subject, text);

        log.info(`Email sent successfully: ${subject}`);
    } catch (error: unknown) {
        log.error(`Error sending email for job ${job.id}:`, error);
        throw error;
    }
};

// Create worker to process the email jobs.
const mailWorker = new Worker<Email>(
    "email-queues",
    async (job: Job<Email>) => await processMailJob(job),
    workerOptions
);

// Handle worker Events NB - This is optional
const mailQueueEvents = new QueueEvents("email-queues", {
    connection
});

mailQueueEvents.on("completed", (jobId) => {
    log.info(`Job completed successfully: ${jobId}`);
});

mailQueueEvents.on("failed", (jobId, failedReson) => {
    log.error(`Job failed: ${jobId}, Reason: ${failedReson}`);
});

// listening to completed or failed jobs by attaching listeners to the workers
mailWorker.on("completed", (job: Job) => console.info(`Job ${job.id} completed successfully`));
mailWorker.on("failed", (job, err) => console.error(`Job ${job!.id} failed with error: ${err.message}`));

mailWorker.on("ready", () => {
    console.info("Worker is ready and connected to Bull/Redis.");
});

mailWorker.on("stalled", (jobId) => {
    console.warn(`Job ${jobId} has stalled and will be retried.`);
});

mailWorker.on("error", (err) => {
    console.error(`Worker encountered an error: ${err.message}`);
});


export default {
    addMailToQueue,
    mailWorker
}