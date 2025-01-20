import { PhoneNumber } from './../../../../../node_modules/twilio/lib/interfaces.d';
import { ChannelCode } from "./Enums";

//---- all payload models related to transactions will be here
// --- no entity or object that will go to the database must be found here please
export type ICreateWallet = {
  email: string;
  bvn: string;
  PhoneNumber: string;
  firstName: string;
  lastName: string;
  nin: string;
  channel: ChannelCode;
};

export type IDebitWallet = {
  name: string;
  nin: string;
  channel: ChannelCode;
};

export type IWithdrawWallet = {
  name: string;
  nin: string;
  channel: ChannelCode;
};

export type ITransactionHisory = {
  name: string;
  nin: string;
  channel: ChannelCode;
};


export type IWalletDetails = {
    name: string;
    nin: string;
    channel: ChannelCode;
  };