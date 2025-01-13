import { BaseEvent } from "@intmax2-functions/shared";

export type SentMessageEventLog = {
  sender: string;
  target: string;
  value: bigint;
  messageNonce: bigint;
  gasLimit: bigint;
  message: string;
};

export interface SentMessageEvent extends BaseEvent {
  args: SentMessageEventLog;
}

export interface WithdrawalEventLog {
  withdrawalHash: string;
}

export interface WithdrawalClaimableEvent extends BaseEvent {
  args: WithdrawalClaimableEventLog;
}

export interface WithdrawalClaimableEventLog extends WithdrawalEventLog {}
