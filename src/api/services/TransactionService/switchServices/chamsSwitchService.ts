import { walletsAbstracts } from "../Abstracts/walletsAbstracts";

// this is the "ChamsSwitchService" service provider

export class ChamsSwitchService extends walletsAbstracts {
  constructor() {
    super();
  }

  async createWallets(): Promise<any> {
    return "Creating wallets... from chamsSwitch service";
  }
  async debitWallets(): Promise<any> {
    return "Debiting wallets... from chamsSwitch service";
  }

  async withdrawWallets(): Promise<any> {
    return "withdrawing from wallets... from chamsSwitch service";
  }

  async walletDetails(): Promise<any> {
    return "fetching wallet details... from chamsSwitch service";
  }
  async transactionHistory(): Promise<any> {
    return "fetching transaction history... from chamsSwitch service";
  }
}
