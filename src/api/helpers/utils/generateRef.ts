export const generateReference = (type: string): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return type === "transaction"
        ? `myWALLT-TRANS-${timestamp}-${random}`
        : `myWALLT-TRANSF-${timestamp}-${random}`;
};
