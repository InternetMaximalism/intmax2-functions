export type ScrollMessengerResponse = {
  errcode: number;
  errmsg: string;
  data: {
    results: ScrollMessengerResult[];
    total: number;
  };
};

export type ScrollMessengerResult = {
  hash: string;
  replay_tx_hash: string;
  refund_tx_hash: string;
  message_hash: string;
  token_type: number;
  token_ids: number[];
  token_amounts: string[];
  message_type: number;
  l1_token_address: string;
  l2_token_address: string;
  block_number: number;
  tx_status: number;
  counterpart_chain_tx: {
    hash: string;
    block_number: number;
  };
  claim_info: ClaimInfo;
  block_timestamp: number;
  batch_deposit_fee: string;
};

export type ClaimInfo = {
  from: string;
  to: string;
  value: string;
  nonce: string;
  message: string;
  proof: {
    batch_index: string;
    merkle_proof: string;
  };
  claimable: boolean;
};

export type MessengerType = "withdrawal" | "claim";
