/* eslint-disable no-unused-vars */

enum TransactionStatus {
  Pending = "Pending",
  Successful = "Completed",
  Failed = "Failed",
  Flagged = "Flagged"
}

enum TransactionType {
  Debit = "Debit",
  Credit = "Credit"
}

enum PaymentType {
  Card = "Card",
  Account = "Account"
}

export { TransactionStatus, TransactionType, PaymentType };
