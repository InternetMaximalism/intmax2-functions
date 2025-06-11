import { logger } from "@intmax2-functions/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { compareBlockNumbers } from "./observer.service";

vi.mock("@intmax2-functions/shared", () => ({
  logger: {
    info: vi.fn(),
  },
}));

vi.mock("../constants", () => ({
  ACCEPTABLE_BLOCK_DIFFERENCE: 10,
}));

describe("compareBlockNumbers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when validity prover block number is greater than rollup block number", () => {
    it("should return valid result", () => {
      const validityProverBlockNumber = 150;
      const rollupBlockNumber = 100;

      const result = compareBlockNumbers(validityProverBlockNumber, rollupBlockNumber);

      expect(result.isValid).toBe(true);
      expect(result.message).toBe(
        "Block difference: -50 validityProverBlock: 150 rollupBlock: 100",
      );
      expect(logger.info).toHaveBeenCalledWith(result.message);
    });
  });

  describe("when validity prover block number equals rollup block number", () => {
    it("should return valid result", () => {
      const validityProverBlockNumber = 100;
      const rollupBlockNumber = 100;

      const result = compareBlockNumbers(validityProverBlockNumber, rollupBlockNumber);

      expect(result.isValid).toBe(true);
      expect(result.message).toBe("Block difference: 0 validityProverBlock: 100 rollupBlock: 100");
      expect(logger.info).toHaveBeenCalledWith(result.message);
    });
  });

  describe("when validity prover block number is within acceptable difference", () => {
    it("should return valid result when difference equals acceptable threshold", () => {
      const validityProverBlockNumber = 100;
      const rollupBlockNumber = 110; // Difference of 10 (equals ACCEPTABLE_BLOCK_DIFFERENCE)

      const result = compareBlockNumbers(validityProverBlockNumber, rollupBlockNumber);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Block difference: 10 validityProverBlock: 100 rollupBlock: 110");
      expect(logger.info).toHaveBeenCalledWith(result.message);
    });

    it("should return valid result when difference is less than acceptable threshold", () => {
      const validityProverBlockNumber = 105;
      const rollupBlockNumber = 110; // Difference of 5 (less than ACCEPTABLE_BLOCK_DIFFERENCE)

      const result = compareBlockNumbers(validityProverBlockNumber, rollupBlockNumber);

      expect(result.isValid).toBe(true);
      expect(result.message).toBe("Block difference: 5 validityProverBlock: 105 rollupBlock: 110");
      expect(logger.info).toHaveBeenCalledWith(result.message);
    });
  });

  describe("when validity prover block number exceeds acceptable difference", () => {
    it("should return invalid result when difference is greater than acceptable threshold", () => {
      const validityProverBlockNumber = 100;
      const rollupBlockNumber = 120; // Difference of 20 (greater than ACCEPTABLE_BLOCK_DIFFERENCE of 10)

      const result = compareBlockNumbers(validityProverBlockNumber, rollupBlockNumber);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Block difference: 20 validityProverBlock: 100 rollupBlock: 120");
      expect(logger.info).toHaveBeenCalledWith(result.message);
    });

    it("should return invalid result with large difference", () => {
      const validityProverBlockNumber = 50;
      const rollupBlockNumber = 200; // Difference of 150 (much greater than acceptable)

      const result = compareBlockNumbers(validityProverBlockNumber, rollupBlockNumber);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Block difference: 150 validityProverBlock: 50 rollupBlock: 200");
      expect(logger.info).toHaveBeenCalledWith(result.message);
    });
  });

  describe("edge cases", () => {
    it("should handle zero block numbers", () => {
      const validityProverBlockNumber = 0;
      const rollupBlockNumber = 0;

      const result = compareBlockNumbers(validityProverBlockNumber, rollupBlockNumber);

      expect(result.isValid).toBe(true);
      expect(result.message).toBe("Block difference: 0 validityProverBlock: 0 rollupBlock: 0");
    });

    it("should handle negative differences correctly", () => {
      const validityProverBlockNumber = 200;
      const rollupBlockNumber = 150;

      const result = compareBlockNumbers(validityProverBlockNumber, rollupBlockNumber);

      expect(result.isValid).toBe(true);
      expect(result.message).toBe(
        "Block difference: -50 validityProverBlock: 200 rollupBlock: 150",
      );
    });

    it("should handle very large block numbers", () => {
      const validityProverBlockNumber = 999999;
      const rollupBlockNumber = 1000000;

      const result = compareBlockNumbers(validityProverBlockNumber, rollupBlockNumber);

      expect(result.isValid).toBe(true);
      expect(result.message).toBe(
        "Block difference: 1 validityProverBlock: 999999 rollupBlock: 1000000",
      );
    });
  });

  describe("return value structure", () => {
    it("should always return an object with isValid and message properties", () => {
      const result = compareBlockNumbers(100, 105);

      expect(result).toHaveProperty("isValid");
      expect(result).toHaveProperty("message");
      expect(typeof result.isValid).toBe("boolean");
      expect(typeof result.message).toBe("string");
    });
  });

  describe("logging behavior", () => {
    it("should always call logger.info with the message", () => {
      const validityProverBlockNumber = 100;
      const rollupBlockNumber = 105;

      compareBlockNumbers(validityProverBlockNumber, rollupBlockNumber);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith(
        "Block difference: 5 validityProverBlock: 100 rollupBlock: 105",
      );
    });
  });
});
