import { redirect } from "next/navigation";

export function forbidden(): never {
  redirect("/error/forbidden");
}
