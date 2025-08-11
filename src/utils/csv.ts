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
