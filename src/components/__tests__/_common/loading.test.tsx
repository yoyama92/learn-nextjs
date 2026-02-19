import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Loading } from "../../_common/loading";

describe("Loading", () => {
  test("renders without throwing", () => {
    expect(() => render(<Loading />)).not.toThrow();
  });
});
