export function unauthorized(): never {
  throw Error("認証エラー");
}

export function forbidden(): never {
  throw Error("認可エラー");
}
