export interface TokenFee {
  token_index: number;
  amount: string;
}

export interface BuilderFeeInfoResponse {
  version: string;
  blockBuilderAddress: string;
  beneficiary: string;
  registrationFee: TokenFee[];
  nonRegistrationFee: TokenFee[];
  registrationCollateralFee: TokenFee[] | null;
  nonRegistrationCollateralFee: TokenFee[] | null;
}
