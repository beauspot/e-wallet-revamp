import axios from "axios";
import {stringify} from 'flatted';
import Flutterwave from "flutterwave-node-v3";
import { Worker, Queue, Job, QueueEvents, ConnectionOptions } from "bullmq";

import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";
import redisModule from "@/configs/redis.config";
import AppError from "@/utils/appErrors";
import { AppDataSource } from "@/configs/db.config";
import {
    virtualAccountPayload as VANPayload,
    FlutterwaveVirtualAccountResponse as FlwResponse
} from "@/interfaces/flutterwave.interface";

const { redisClient } = redisModule;
const connection: ConnectionOptions = redisClient;
const Fltw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);

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
        tx_ref: `tx_$x${Date.now()}`,
        is_permanent: true,
        // firstname: user.firstname,
        // lastname: user.lastname,
        // phonenumber: user.phonenumber,
        narration: `Virtual account for ${user.firstname} ${user.lastname}`
    };

    await CreateVirtualAccountQueue.add("walletQueues", { userId, ...payload})
};

const walletWorker = new Worker<VANPayload>("walletQueues",
    async (job: Job<VANPayload>) => {
        const { userId, ...payload } = job.data;
        
        
    try {
        // call flutterwave SDK to create a virtual account
        log.info(`Payload for creating VAN: ${JSON.stringify(payload, null, 2)}`);
        // const FLUTTERWAVE_API_URL = `https://api.flutterwave.com/v3/virtual-account-numbers`;

        // const headers = {
        //     Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY!}`,
        //     "Content-Type": "application/json",
        // };
        
        log.info(`Wallet Payload: ${stringify(payload)}`);
        // log.info(`Processing job ${job.id} with payload: ${JSON.stringify(payload)}`);

        const virtualAccountResponse: FlwResponse = await Fltw.VirtualAcct.create(payload);
        // const virtualAccountResponse = await axios.post<FlwResponse>(FLUTTERWAVE_API_URL, payload, { headers });
        // log.info(`Response: ${stringify(virtualAccountResponse)}`);
        log.info(`Flutterwave API Response:  ${ JSON.stringify(virtualAccountResponse.data, null, 2)}`);
        
        let { account_number, bank_name, flw_ref, account_status, response_code, response_message, order_ref, expiry_date, note, amount } = virtualAccountResponse.data;

        // Ensure the required fields are present
        if (!account_number || !bank_name || !flw_ref) {
            throw new AppError("Invalid data received from Flutterwave API");
        }

        // Check for valid status and response message
        if (account_status !== "active" || !["Transaction in progress", "success"].includes(response_message)) {
            throw new AppError(
                `Failed to create a virtual account: ${response_message || "Unknown Error"}`
            );
        }

        // Save Wallet details in the db
        const userRepository = AppDataSource.getRepository(User);
        const walletRepository = AppDataSource.getRepository(UserWallet);

        //  log.info(`Wallet created: ${job.id!}: ${JSON.stringify(virtualAccountResponse, null, 2)}`);

        // Fetch the customer 
        const user = await userRepository.findOneBy({ id: userId});
        if (!user) throw new AppError(`User not found for ID: ${userId}`, "404", false);

        const wallet = new UserWallet();
        wallet.user = user;
        wallet.virtualAccountNumber = account_number;
        wallet.virtualAccountName = `${user.firstname} ${user.lastname}`;
        wallet.bankName = bank_name;
        wallet.txReference = flw_ref;
        wallet.accountStatus = account_status;
        wallet.responseCode = response_code;
        wallet.responseMessage = response_message;
        wallet.orderRef = order_ref;
        wallet.expiryDate = expiry_date;
        wallet.amount = amount;
        wallet.narration = note;

        await walletRepository.save(wallet);
        log.info("Wallet created and linked to user:", userId);
    
        log.info(`Virtual account successfully created for User ID . with account number: ${wallet.virtualAccountNumber}`);

        return virtualAccountResponse.data;
    } catch (error: any) {
        throw new AppError(`Error processing Job ${job.id}: ${error.message}`);
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