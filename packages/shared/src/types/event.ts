export type EventData = {
  id: string;
  lastBlockNumber: number;
};

export type DepositsRelayedEventData = EventData & {
  lastUpToDepositId: number;
};
