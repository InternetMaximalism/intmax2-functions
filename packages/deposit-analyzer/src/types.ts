export interface DepositAnalysisSummary {
  upToDepositId: bigint;
  rejectDepositIds: bigint[];
  numDepositsToRelay: bigint;
  gasLimit: bigint;
}

export interface BatchParams {
  upToDepositId: bigint;
  rejectDepositIds: bigint[];
  numDepositsToRelay: bigint;
  gasLimit: bigint;
  blockNumber: bigint;
}
