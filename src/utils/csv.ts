import Papa from "papaparse";

/**
 * ヘッダーとコンテンツを受け取ってCSVファイルに出力する文字列を返す。
 * @param header ヘッダー
 * @param content コンテンツ
 * @returns CSVファイルのBody
 */
export const buildCSVContent = (
  header: string[],
  content: string[][],
): string => {
  const body = [header, ...content]
    .map((row, index) => {
      if (header.length !== row.length) {
        throw new Error(`[${index}行目]ヘッダーとコンテンツの長さが異なる`);
      }
      return row.map((cell) => `"${cell}"`).join(",");
    })
    .join("\n");

  // 末尾は改行で終わらせる。
  return `${body}\n`;
};

/**
 * CSV文字列を2次元配列に変換する。
 * RFC 4180のうち、ダブルクォートによるエスケープをサポートする。
 * @param csv CSV文字列
 * @returns 2次元配列
 */
export const parseCSVContent = (csv: string): string[][] => {
  const result = Papa.parse<string[]>(csv, {
    skipEmptyLines: "greedy",
  });

  if (result.errors.length > 0) {
    throw new Error("CSVのパースに失敗しました。");
  }

  return result.data.map((row) => row.map((cell) => `${cell ?? ""}`));
};
