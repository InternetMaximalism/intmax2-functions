import type { AxiosInstance } from "axios";

// this interface is same as sdk interface
export interface PredicateRequest {
  from: string;
  to: string;
  data: string;
  msg_value: string;
}

export interface PredicateResponse {
  is_compliant: boolean;
  task_id: string;
  expiry_block: number;
  signers: string[];
  signature: string[];
}

export interface IPredicateClient {
  evaluatePolicy(request: PredicateRequest): Promise<PredicateResponse>;
}

export interface PredicateConfig {
  apiUrl: string;
  apiKey: string;
  tokenID?: string;
  axiosInstance?: AxiosInstance;
}
