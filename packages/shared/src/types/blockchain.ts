import type { Abi, Account } from "viem";

export enum TokenType {
  NATIVE,
  ERC20,
  ERC721,
  ERC1155,
}

export interface BaseEvent {
  name: string;
  address: string;
  blockNumber: bigint;
  blockTimestamp: string;
  transactionHash: string;
}

export interface DepositEventLog {
  depositId: bigint;
  sender: string;
  recipientSaltHash: string;
  tokenIndex: number;
  amount: bigint;
  depositedAt: bigint;
}

export interface DepositEvent extends BaseEvent {
  args: DepositEventLog;
}

export interface DepositsAnalyzedAndRelayedEventLog {
  upToDepositId: bigint;
  rejectDepositIds: bigint[];
  gasLimit: bigint;
  message: string;
}

export interface DepositsAnalyzedAndRelayedEvent extends BaseEvent {
  args: DepositsAnalyzedAndRelayedEventLog;
}

export interface L1SentMessageEventLog {
  sender: string;
  target: string;
  value: bigint;
  messageNonce: bigint;
  gasLimit: bigint;
  message: string;
}

export interface L1SentMessageEvent extends BaseEvent {
  args: L1SentMessageEventLog;
}

export interface ContractCallParameters {
  contractAddress: `0x${string}`;
  abi: Abi;
  functionName: string;
  account: Account;
  args: any[];
}

export interface ContractCallOptions {
  value?: bigint;
  nonce?: number;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

export interface ContractCallOptionsEthers {
  value?: bigint;
  nonce?: number;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

export interface RetryOptions {
  nonce?: number | null;
  maxFeePerGas: bigint | null;
  maxPriorityFeePerGas: bigint | null;
}

export interface RetryOptionsEthers {
  nonce?: number | null;
  gasPrice: bigint | null;
}

export interface BatchedCalldata {
  encodedCalldata: string;
}
