export const batchHandler = async <T>(
  body: T,
  execute: (body: T) => Promise<void>,
) => {
  // バッチ処理をここで実行
  console.log("Batch processing started:", body);
  try {
    await execute(body);
    console.log("Batch processing completed");
  } catch (error) {
    console.error("Batch processing failed:", error);
  }
};
