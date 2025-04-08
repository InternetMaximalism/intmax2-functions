export interface DepositAnalysisSummary {
  upToDepositId: bigint;
  numDepositsToRelay: bigint;
  gasLimit: bigint;
}

export interface BatchParams {
  upToDepositId: bigint;
  numDepositsToRelay: bigint;
  gasLimit: bigint;
  blockNumber: bigint;
}
