import { describe, expect, it } from "vitest";
import { httpUrlSchema } from "../lib/utils/http-url";

describe("URL scheme validation", () => {
  it.each(["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "ftp://example.com/file"])(
    "rejects %s",
    (value) => {
      expect(httpUrlSchema.safeParse(value).success).toBe(false);
    }
  );

  it("accepts HTTP and HTTPS URLs", () => {
    expect(httpUrlSchema.safeParse("http://example.com/path").success).toBe(
      true
    );
    expect(httpUrlSchema.safeParse("https://example.com/path").success).toBe(
      true
    );
  });
});
