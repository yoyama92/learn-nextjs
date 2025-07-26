import { redirect } from "next/navigation";

export function unauthorized(): never {
  throw Error("認証エラー");
}

export function forbidden(): never {
  redirect("/error/forbidden");
}
