import { UserTransactionModel } from "@/api/db/transactions.entity";

export interface TransactionServiceInterface {
    /**
     * Fetches transaction by its reference.
     * @param reference - The reference of the transaction to retrieve
     * @returns A promise that resolves the transaction.
     */
    getTransaction(reference: string): Promise<UserTransactionModel>;

    /**
     * Fetches all transactions for a given user ID.
     * @param userId - The ID of the user whose transactions are to be retrieved (also cached)
     * @returns A promise that resolves to an array of transactions.
     */
    getTransactions(userId: string): Promise<UserTransactionModel[]>;

    /**
     * Verifies and updates the status of a transaction
     * @param data - The transaction to create
     * @returns A promise that resolves the updated transaction.
     */
    verifyTransactionStatus(data: Partial<UserTransactionModel>): Promise<UserTransactionModel | null>;
}