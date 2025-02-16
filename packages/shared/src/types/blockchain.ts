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

export interface DepositEvent extends BaseEvent {
  args: DepositEventLog;
}

export interface DepositEventLog {
  depositId: bigint;
  sender: string;
  recipientSaltHash: string;
  tokenIndex: number;
  amount: bigint;
  depositedAt: bigint;
}

export interface DepositsAnalyzedAndRelayedEvent extends BaseEvent {
  args: DepositsAnalyzedAndRelayedEventLog;
}

export interface DepositsAnalyzedAndRelayedEventLog {
  upToDepositId: bigint;
  rejectDepositIds: bigint[];
  gasLimit: bigint;
  message: string;
}

export interface BlockBuilderHeartbeatEvent extends BaseEvent {
  args: BlockBuilderHeartbeatEventLog;
}

export interface BlockBuilderHeartbeatEventLog {
  blockBuilder: string;
  url: string;
}

export interface SentMessageEventLog {
  sender: string;
  target: string;
  value: bigint;
  messageNonce: bigint;
  gasLimit: bigint;
  message: string;
}

export interface SentMessageEvent extends BaseEvent {
  args: SentMessageEventLog;
}

export interface WithdrawalClaimableEvent extends BaseEvent {
  args: WithdrawalClaimableEventLog;
}

export interface WithdrawalClaimableEventLog {
  withdrawalHash: string;
}

export interface BatchedCalldata {
  encodedCalldata: string;
}
