import { useCallback, useState } from "react";

type FileDownloadParams = {
  request: () => Promise<Response>;
  fileName?: string;
};

/**
 * ファイルダウンロードを共通化するhook。
 * - 進行中状態
 * - Blob化・ダウンロード処理
 * - ファイル名の決定
 */
export const useFileDownload = (): {
  isDownloading: boolean;
  download: (params: FileDownloadParams) => Promise<void>;
} => {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(async (params: FileDownloadParams) => {
    const { request, fileName: fallbackFileName = "download" } = params;

    setIsDownloading(true);
    try {
      const response = await request();

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      const contentType =
        response.headers.get("Content-Type") ?? "application/octet-stream";
      const blob = await response.blob();

      const contentDisposition = response.headers.get("Content-Disposition");
      const fileName =
        contentDisposition?.match(/filename="([^"]+)"/)?.[1] ??
        fallbackFileName;

      const blobUrl = URL.createObjectURL(
        new Blob([blob], { type: contentType }),
      );
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = fileName;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();

      // ダウンロード後にURLを解放してメモリリークを防止
      // ダウンロード処理が完了するまでURLを保持するためにsetTimeoutで遅延させる
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { isDownloading, download };
};
