import { describe, expect, it } from "vitest";

describe("Vercel runtime configuration", () => {
  it("keeps browser-exposed configuration separate from server-only secrets", () => {
    expect("DATABASE_URL").not.toMatch(/^VITE_/);
    expect("BLOB_READ_WRITE_TOKEN").not.toMatch(/^VITE_/);
    expect("CLIENT_ADMIN_PASSWORD").not.toMatch(/^VITE_/);
  });
});
