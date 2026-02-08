import { describe, expect, test } from "vitest";

import {
  ForbiddenError,
  forbidden,
  UnauthorizedError,
  unauthorized,
} from "../error";

describe("UnauthorizedError", () => {
  test("エラーが正しいメッセージで生成される", () => {
    const error = new UnauthorizedError();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(UnauthorizedError.MESSAGE);
  });
});

describe("ForbiddenError", () => {
  test("エラーが正しいメッセージで生成される", () => {
    const error = new ForbiddenError();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(ForbiddenError.MESSAGE);
  });
});

describe("unauthorized関数", () => {
  test("UnauthorizedErrorを投げる", () => {
    expect(() => {
      unauthorized();
    }).toThrow(UnauthorizedError);
  });
});

describe("forbidden関数", () => {
  test("ForbiddenErrorを投げる", () => {
    expect(() => {
      forbidden();
    }).toThrow(ForbiddenError);
  });
});

describe("エラークラスの継承チェーン", () => {
  test("UnauthorizedErrorはErrorを継承している", () => {
    const error = new UnauthorizedError();
    expect(error instanceof Error).toBe(true);
    expect(error instanceof UnauthorizedError).toBe(true);
  });

  test("ForbiddenErrorはErrorを継承している", () => {
    const error = new ForbiddenError();
    expect(error instanceof Error).toBe(true);
    expect(error instanceof ForbiddenError).toBe(true);
  });
});

describe("エラーハンドリングシナリオ", () => {
  test("unauthorized後のキャッチハンドリング", () => {
    try {
      unauthorized();
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedError);
      if (error instanceof UnauthorizedError) {
        expect(error.message).toBe(UnauthorizedError.MESSAGE);
      }
    }
  });

  test("forbidden後のキャッチハンドリング", () => {
    try {
      forbidden();
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenError);
      if (error instanceof ForbiddenError) {
        expect(error.message).toBe(ForbiddenError.MESSAGE);
      }
    }
  });

  test("複数のエラーを識別できる", () => {
    const handleError = (fn: () => never) => {
      try {
        fn();
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return "unauthorized";
        }
        if (error instanceof ForbiddenError) {
          return "forbidden";
        }
        return "unknown";
      }
    };

    expect(handleError(unauthorized)).toBe("unauthorized");
    expect(handleError(forbidden)).toBe("forbidden");
  });
});
