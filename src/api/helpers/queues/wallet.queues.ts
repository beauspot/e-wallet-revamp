import { Worker, Queue, Job, QueueEvents, ConnectionOptions } from "bullmq";

import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";
import { UserTransactionModel } from "@/db/transactions.entity";
import redisModule from "@/configs/redis.config";
import { Flw } from "@/integrations/flutterwave";
import AppError from "@/utils/appErrors";
import { AppDataSource } from "@/configs/db.config";
import { virtualAccountPayload as VANPayload } from "@/interfaces/flutterwave.interface";

const { redisClient } = redisModule;
const connection: ConnectionOptions = redisClient;
const flutterwaveInstance = new Flw(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY)


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

/**
* Add a VAN job to the queue
* @param vanpayload - VANPayload containing virtual account details
*/

const addVANToQueue = async (vanpayload: VANPayload): Promise<void> => {
    try {
        await CreateVirtualAccountQueue.add("FLW-queues", vanpayload, {
            priority: 2, // Priority level for the job
        });
        log.info(`VAN job added to the queue: ${vanpayload.firstName}`);
    } catch (error: any) {
        log.error('Error adding email job:', error);
        throw new AppError('Error adding email job:', error.messsage);
    }
};

const createVirtualAccountWorker = new Worker<VANPayload>('FLW-queues', async (job: Job<VANPayload>) => {
    const { userId, email, bvn, tx_ref, account_no, accountName } = job.data;

    try {
        // call flutterwave SDK to create a virtual account
        const virtualAccountResponse = await flutterwaveInstance.createVAN({
            email,
            bvn,
            tx_ref,
            is_permanent: true,
            firstName: job.data.firstName,
            lastName: job.data.lastName,
            bankName: job.data.bankName,
            phoneNumber: job.data.phoneNumber,
            account_no,
            accountName,
        });

        const { account_number, account_name } = virtualAccountResponse;

        const walletRepository = AppDataSource.getRepository(UserWallet);
        const userRepository = AppDataSource.getRepository(User);

        // Fetch the customer 
        const user = await userRepository.findOne({
            where: { id: userId },
            relations: ['wallet']
        });
        if (!user) throw new AppError(`User with ID ${userId} or wallet not found.`);

        user.wallet.virtualAccountNumber = account_no;
        user.wallet.virtualAccountName = accountName;
        
        // create & save the user's wallet;
        // const newWallet = walletRepository.create({
        //     balance: 0,
        //     user,
        // });

        // console.log(`Wallet created: ${JSON.stringify(newWallet, null, 2)}`);
        
        
        // const saveWallet = await walletRepository.save(newWallet);
        const saveWallet = await walletRepository.save(user.wallet);
        
        log.info(`Wallet created: ${JSON.stringify(saveWallet, null, 2)}`);
        

        log.info(`Virtual account successfully created for User ID ${userId}. with account number: ${account_number}`);
        // return saveWallet;
        return virtualAccountResponse;
    } catch (error: any) {
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
        age: 24 * 3600, // Keep failed jobs up to 24hrs
    },
});

// Handle worker Events NB - This is optional
/**
* Process a VAN job
* @param job - Job<VANPayload>
*/
// const processVANJob = 

// listening to completed or failed jobs by attaching listeners to the workers
createVirtualAccountWorker.on("completed", (job) => log.info(`Job ${job.id} has been completed successfully`));

createVirtualAccountWorker.on("failed", (job, err) => log.error(`Job ${job?.id} failed with error: ${err.message}`))

const vanQueueEvents = new QueueEvents("FLW-queues", {
    connection
});

vanQueueEvents.on("completed", (jobId) => {
    log.info(`Job completed successfully: ${jobId}`);
});

vanQueueEvents.on("failed", (jobId, failedReson) => {
    log.error(`Job failed: ${jobId}, Reason: ${failedReson}`);
});


createVirtualAccountWorker.on("ready", () => {
    log.info("Worker is ready and connected to Bull/Redis.");
});

createVirtualAccountWorker.on("stalled", (jobId) => {
    log.warn(`Job ${jobId} has stalled and will be retried.`);
});

createVirtualAccountWorker.on("error", (err) => {
    log.error(`Worker encountered an error: ${err.message}`);
});

export default {
    addVANToQueue,
    createVirtualAccountWorker,
    vanQueueEvents
}