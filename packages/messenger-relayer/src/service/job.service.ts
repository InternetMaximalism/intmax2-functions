import { createNetworkClient, logger } from "@intmax2-functions/shared";
import { generateProcessWithdrawalsCalldata } from "./decode.service";
import { fetchAllClaimableScrollMessengerResults } from "./messenger.service";
import { relayMessageWithProof } from "./submit.service";

export const performJob = async (): Promise<void> => {
  const claimableRequests = await fetchAllClaimableScrollMessengerResults();
  if (claimableRequests.length === 0) {
    logger.info("No claimable requests found");
    return;
  }
  logger.info(`Found ${claimableRequests.length} claimable requests`);

  const ethereumClient = createNetworkClient("ethereum");

  for (const claimableRequest of claimableRequests) {
    const calldataBatch = await generateProcessWithdrawalsCalldata(claimableRequest);

    for (const calldata of calldataBatch) {
      await relayMessageWithProof(ethereumClient, {
        ...claimableRequest,
        claim_info: {
          ...claimableRequest.claim_info,
          message: calldata.encodedCalldata,
        },
      });
    }
  }
};
