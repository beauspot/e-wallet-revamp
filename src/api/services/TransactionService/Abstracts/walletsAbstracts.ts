import { ChannelCode } from "../Data/Enums";
import {
  ICreateWallet,
  IDebitWallet,
  ITransactionHisory,
  IWalletDetails,
  IWithdrawWallet,
} from "../Data/Models";

export interface IWallets {
  createWallets: (load: ICreateWallet) => void;
  debitWallets: (load: IDebitWallet) => void;
  withdrawWallets: (load: IWithdrawWallet) => void;
  walletDetails: (load: IWalletDetails) => void;
  transactionHistory: (load: ITransactionHisory) => void;
}

//  ------ This wallet abstract froms the basis of the wallet functionality of each Service provider
// -------- every service provider class extend this class and implement the methods in their own ways
// ----- by service provider classes, i mean chamswitch and the other i called 'anotherSwitchedService'

export abstract class walletsAbstracts implements IWallets {
  constructor() {}

  //   NOTE THAT THIS SHOULD TAKE THE ACTUAL PAYLOAD MODELS IN PLACCE OF THE channelCode enum models i just put here
  abstract createWallets(load: ICreateWallet): Promise<void>;
  abstract debitWallets(load: IDebitWallet): Promise<void>;
  abstract withdrawWallets(load: IWithdrawWallet): Promise<void>;

  abstract walletDetails(load: IWalletDetails): Promise<void>;
  abstract transactionHistory(load: ITransactionHisory): Promise<void>;
}
