/* eslint-disable no-unused-vars */
interface CardChargePayload {
  card_number: string;
  cvv: number;
  expiry_month: string;
  expiry_year: string;
  currency: string;
  amount: string;
  tx_ref: string;
  email?: string;
  phone_number?: string;
  fullname?: string;
  pin?: string;
  enckey?: string;
}

interface AuthorizeCardPaymentPayload {
  otp: string;
  flw_ref: string;
  userId: string;
}

interface TransferPayload {
  account_no: string;
  amount: number;
  recipient: string;
  bank: string;
  currency: string;
  receipientBankCode?: string;
  reference?: string;
  narration?: string;
  senderId?: string;
  transferType: "Wallet" | "3rd-Party";
  callback_url?: string;
  transactionPin: string;
}

interface SubAccounts {
  id?: string;
  account_bank: string;
  account_no: string;
  business_name: string;
  business_email: string;
  business_contact: string;
  business_contact_mobile: string;
  business_mobile?: string;
  split_type?: string;
  split_value?: number;
}

interface virtualAccountPayload {
  email: string;
  bvn: string;
  tx_ref: string;
  is_permanent: boolean;
  // firstname: string;
  // lastname: string;
  bank_name?: string;
  // phonenumber: string;
  narration: string;
  userId?: string;
  // account_no: string,
  // accountName: string
}

interface AccountInfoPayload {
  account_number: string;
  account_bank: string;
}

enum MessageStatusType {
  Active = "active",
  Success = "success",
  Failed = "failed"
}

interface FlutterwaveVirtualAccountResponse {
  status: string;
  message: MessageStatusType;
  data: {
    response_code: string;
    response_message: string;
    flw_ref: string;
    order_ref: string;
    account_number: string;
    account_status?: string;
    frequency: number;
    bank_name: string;
    created_at: string;
    expiry_date: string;
    note: string;
    amount: string;
  };
}

export {
  CardChargePayload,
  AuthorizeCardPaymentPayload,
  TransferPayload,
  SubAccounts,
  virtualAccountPayload,
  AccountInfoPayload,
  FlutterwaveVirtualAccountResponse
};
