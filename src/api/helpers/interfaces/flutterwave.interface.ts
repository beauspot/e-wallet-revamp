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
};

interface AuthorizeCardPaymentPayload {
    otp: string;
    flw_ref: string;
    userId: string;
};

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
    transferType: "Wallet" | "3rd-Party" 
    callback_url?: string;
    transactionPin: string;
};

interface SubAccounts {
    id?: string;  
    account_bank: string;
    account_number: string;
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
    tx_ref?: string;
    is_permanent: true;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    narration?: string;
    userId: string;
    walletId: string;
}


interface AccountInfoPayload {
    account_number: string;
    account_bank: string;
}

export {
    CardChargePayload,
    AuthorizeCardPaymentPayload,
    TransferPayload,
    SubAccounts,
    virtualAccountPayload,
    AccountInfoPayload,
};