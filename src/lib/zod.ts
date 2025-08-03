import * as z from "zod";

z.config({
  customError: (iss) => {
    if (iss.code === "too_small") {
      if (iss.origin === "string" && iss.minimum === 1) {
        return "必須項目です。";
      }
    }

    if (iss.code === "invalid_format") {
      if (iss.format === "email") {
        return "メールアドレスの形式が正しくありません。";
      }
    }
  },
});

export const passwordSchema = z.string().min(8).max(32);

export { z };
