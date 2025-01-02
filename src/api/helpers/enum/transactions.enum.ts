enum TransactionStatus {
    Pending = "pending",
    Successful = "successful",
    Failed = "failed",
    Flagged = "flagged"
};

enum TransactionType {
    Debit = "debit",
    Credit = "credit",
}

enum PaymentType {
    Card = "card",
    Account = "account",
}

export { TransactionStatus, TransactionType, PaymentType };