import { AppDataSource } from "@/api/helpers/configs/db.config";
import { ChannelCode } from "../Data/Enums";
import {
  ICreateWallet,
  IDebitWallet,
  ITransactionHisory,
  IWalletDetails,
  IWithdrawWallet,
} from "../Data/Models";
import {
  IWalletSwitcher,
  walletSwitcher,
} from "../Switchers/walletSwitchers";
import AppError from "@/api/helpers/utils/appErrors";
import { UserWallet } from "@/api/db/wallet.entity";

export interface IWalletManager {
  createWallets: (load: ICreateWallet) => Promise<any>;
  debitWallets: (load: IDebitWallet) => Promise<any>;
  withdrawWallets: (load: IWithdrawWallet) => Promise<any>;
  transactionHistory: (load: ITransactionHisory) => Promise<any>;
  walletDetails: (load: IWalletDetails) => Promise<any>;
}

// ---- remember that switcher class called walletSwitcher that aggregates the service provider?
// ----- it return the service provider it finds according to the channel code to this manager
//  ---- it is this manager that now does writiing to db
//  --- formats request before passing to the service provider if need be
// --- also formats the reponse from all the services providers into one common form

export class WalletManager implements IWalletManager {
  switchService: IWalletSwitcher = new walletSwitcher();
  

  async createWallets(load: ICreateWallet) {
    try {
      const managedService = this.switchService.getWalletService(load.channel);
      return await managedService.createWallets(load);
    } catch (error) {
      console.error(
        `Error creating wallet for channel: ${load.channel}`,
        error
      );
      throw new Error("Failed to create wallet");
    }
  }

  async debitWallets(load: IDebitWallet) {
    const managedService = this.switchService.getWalletService(load.channel);
    return await managedService.debitWallets(load);
  }

  async withdrawWallets(load: IWithdrawWallet) {
    const managedService = this.switchService.getWalletService(load.channel);
    return await managedService.withdrawWallets(load);
  }

  async transactionHistory(load: ITransactionHisory) {
    const managedService = this.switchService.getWalletService(load.channel);
    return await managedService.transactionHistory(load);
  }

  async walletDetails(load: IWalletDetails) {
    const managedService = this.switchService.getWalletService(load.channel);
    return await managedService.walletDetails(load);
  }

  async getWallet(userId: string): Promise<UserWallet> {
    try {
        const walletRepo = AppDataSource.getRepository(UserWallet);
        const wallet = await walletRepo.findOne({
            where: { user: { id: userId } },
            relations: ["user"]
        });

        if (!wallet) throw new AppError(`Wallet Not found Please contact administrator`, "Failed", false);

        return wallet;
    } catch (error: any) {
        throw new AppError(`$error.message`, "Failed", false)
    }
};

async getBalance(userId: string): Promise<number>{
    try {
        const walletRepository = AppDataSource.getRepository(UserWallet);
        const wallet = await walletRepository.findOne({
            where: { user: { id: userId } },
            relations: ["user"]
        });

        if (!wallet) throw new AppError(
            `You don't have a wallet. Please contact the administrator`,
            "false", false
        );

        return wallet.balance;

    } catch (error: any) {
        throw new AppError(`${error.message}`, "failed", false);
    }
};
}
