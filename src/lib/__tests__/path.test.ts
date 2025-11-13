import { describe, expect, test } from "vitest";

import { adminPathReg, publicPaths } from "../path";

describe("adminPathReg", () => {
  test("マッチする", () => {
    const paths = ["/admin", "/admin/", "/admin/users"];

    for (const path of paths) {
      expect(adminPathReg.test(path)).toBe(true);
    }
  });

  test("マッチしない", () => {
    const paths = ["/admin/sign-in", "/account"];

    for (const path of paths) {
      expect(adminPathReg.test(path)).toBe(false);
    }
  });
});

describe("publicPaths", () => {
  test("マッチする", () => {
    const paths = ["/sign-in", "/password-reset"];

    for (const path of paths) {
      expect(publicPaths.test(path)).toBe(true);
    }
  });

  test("マッチしない", () => {
    const paths = ["/admin", "/account"];

    for (const path of paths) {
      expect(publicPaths.test(path)).toBe(false);
    }
  });
});
