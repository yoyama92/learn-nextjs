import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Header } from "../../_common/header";

vi.mock("../../../actions/auth", () => ({
  signOut: vi.fn(),
}));

describe("Header", () => {
  test("renders without throwing", () => {
    expect(() => render(<Header />)).not.toThrow();
  });
});
