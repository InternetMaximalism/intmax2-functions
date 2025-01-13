export interface L1SentMessageEventLog {
  sender: string;
  target: string;
  value: bigint;
  messageNonce: bigint;
  gasLimit: bigint;
  message: string;
}

export interface ValidDeposits {
  depositIds: bigint[];
  depositHashes: string[];
}
