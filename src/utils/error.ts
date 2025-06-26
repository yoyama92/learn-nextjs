export function unauthorized(): never {
  throw Error("認証エラー");
}
