import { Worker, Queue, Job, QueueEvents, ConnectionOptions } from "bullmq";

import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";
import redisModule from "@/configs/redis.config";
import { Flw } from "@/integrations/flutterwave";
import AppError from "@/utils/appErrors";
import { AppDataSource } from "@/configs/db.config";
import { virtualAccountPayload as VANPayload } from "@/interfaces/flutterwave.interface";

const { redisClient } = redisModule;
const connection: ConnectionOptions = redisClient;
const flutterwaveInstance = new Flw(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);

// create the virtual account number queue
const CreateVirtualAccountQueue = new Queue<VANPayload>("walletQueues", {
    connection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 1000, // retry after 1sec
        }
    }
});

/**
* Add a VAN job to the queue
* @param vanpayload - VANPayload containing virtual account details
*/

const addVANToQueue = async (userId: string): Promise<void> => {

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });

    if (!user) throw new AppError(`User ${userId} does not exist`);

    const payload: VANPayload = {
        email: user.email,
        bvn: user.bvn,
        bank_name: user.bank_name,
        tx_ref: `tx_$x${Date.now()}`,
        is_permanent: true,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        narration: `Virtual account for ${user.firstName} ${user.lastName}`
    };

    await CreateVirtualAccountQueue.add("createWallet", { userId, ...payload})
};

const walletWorker = new Worker<VANPayload>("walletQueues",
    async (job: Job<VANPayload>) => {
        const {userId, ...payload} = job.data;

    try {
        // call flutterwave SDK to create a virtual account
        // log.info(`Payload for creating VAN: ${JSON.stringify(payload, null, 2)}`);

        const virtualAccountResponse = await flutterwaveInstance.createVAN(payload);

        if (!virtualAccountResponse)
            throw new AppError("Failed to create a virtual account: Response is undefined");
        

        if (!virtualAccountResponse || typeof virtualAccountResponse !== "object") 
            throw new AppError("Invalid response from Flutterwave API: No data returned");
        

        if (virtualAccountResponse.status !== 'success') 
            throw new AppError(`Failed to create virtual account: ${virtualAccountResponse.message}, virtual account Status: ${virtualAccountResponse.status}`);

        // Save Wallet details in the db
        const userRepository = AppDataSource.getRepository(User);
        const walletRepository = AppDataSource.getRepository(UserWallet);

        log.info(`Wallet created: ${JSON.stringify(virtualAccountResponse, null, 2)}`);
        // const { account_no: virtualAccountNo, account_name } = virtualAccountResponse;

        // Fetch the customer 
        const user = await userRepository.findOneBy({ id: userId});
        if (!user) throw new AppError(`User or wallet not found.`);

        const wallet = new UserWallet();
        wallet.user = user;
        wallet.virtualAccountNumber = virtualAccountResponse.virtualAccountNumber;
        wallet.virtualAccountName = virtualAccountResponse.virtualAccountName;
        wallet.bankName = virtualAccountResponse.bankName;
        wallet.txReference = virtualAccountResponse.tx_ref;

        await walletRepository.save(wallet);
        log.info("Wallet created and linked to user:", userId);
        
        log.info(`Wallet created: ${JSON.stringify(wallet, null, 2)}`);
        

        log.info(`Virtual account successfully created for User ID . with account number: ${wallet.virtualAccountNumber}`);

        return virtualAccountResponse;
    } catch (error: any) {
        log.error(error)
        throw new AppError(`Error processing Job ${job.id}: ${error.message}`)
    }
}, {
    connection,
    maxStalledCount: 10,
    stalledInterval: 1000 * 60 * 5, // 5 minutes
    concurrency: 1, // Limit the number of concurrent jobs to 1 (optional)
    limiter: {
        max: 1,
        duration: 1000
    }, // Processes an email every second
    lockDuration: 5000,
    removeOnComplete: {
        age: 3600, // save up to an hour 
        count: 1000, // save up to 1000 jobs
    },
    removeOnFail: {
        age: 24 * 3600, // Keep failed jobs up to 24hr
    },
});

// Handle worker Events NB - This is optional
/**
* Process a VAN job
* @param job - Job<VANPayload>
*/
// const processVANJob = 

// listening to completed or failed jobs by attaching listeners to the workers
walletWorker.on("completed", (job) => log.info(`Job ${job.id} has been completed successfully`));

walletWorker.on("failed", (job, err) => log.error(`Job ${job?.id} failed with error: ${err.message}`))

const vanQueueEvents = new QueueEvents("FLW-queues", {
    connection
});

vanQueueEvents.on("completed", (jobId) => {
    log.info(`Job completed successfully: ${jobId}`);
});

vanQueueEvents.on("failed", (jobId, failedReson) => {
    log.error(`Job failed: ${jobId}, Reason: ${failedReson}`);
});

walletWorker.on("ready", () => {
    log.info("Worker is ready and connected to Bull/Redis.");
});

walletWorker.on("stalled", (jobId) => {
    log.warn(`Job ${jobId} has stalled and will be retried.`);
});

walletWorker.on("error", (err) => {
    log.error(`Worker encountered an error: ${err.message}`);
});

export default {
    addVANToQueue,
    walletWorker,
    vanQueueEvents
}