import { describe, expect, it } from "vitest";

describe("Vercel Blob configuration", () => {
  it("authenticates the configured Blob token against the lightweight listing endpoint", async () => {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    expect(token).toBeTruthy();

    const response = await fetch("https://blob.vercel-storage.com/?limit=1", {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.ok).toBe(true);
  }, 15_000);
});
