import { createBatchLogger } from "./logger";

export const batchHandler = async <T>(
  body: T,
  name: string,
  execute: (body: T) => Promise<void>,
) => {
  const logger = createBatchLogger(name);
  // バッチ処理をここで実行
  logger.info({ body }, "Batch processing started");
  try {
    await execute(body);
    logger.info("Batch processing completed");
  } catch (error) {
    logger.error({ error }, "Batch processing failed");
  }
};
