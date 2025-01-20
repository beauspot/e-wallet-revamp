import { walletsAbstracts } from "../Abstracts/walletsAbstracts";


// this is the "anotherSwitchService" service provider

export class anotherSwitchService extends walletsAbstracts {
  constructor() {
    super();
  }

  async createWallets(): Promise<any> {
    return "Creating wallets from another switch service...";
  }
  async debitWallets(): Promise<any> {
    return "Debiting wallets another switch service...";
  }

  async withdrawWallets(): Promise<any> {
    return "withdrawing from wallets another switch service...";
  }

  async walletDetails(): Promise<any> {
    return "fetching wallet details another switch service...";
  }
  async transactionHistory(): Promise<any> {
    return "fetching transaction history another switch service...";
  }
}
