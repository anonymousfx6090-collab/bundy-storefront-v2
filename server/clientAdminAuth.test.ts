import { afterEach, describe, expect, it } from "vitest";
import { createClientAdminSession, validateClientAdminCredentials } from "./clientAdminAuth";

const originalEmail = process.env.CLIENT_ADMIN_EMAIL;
const originalPassword = process.env.CLIENT_ADMIN_PASSWORD;

afterEach(() => {
  process.env.CLIENT_ADMIN_EMAIL = originalEmail;
  process.env.CLIENT_ADMIN_PASSWORD = originalPassword;
});

describe("client admin credentials", () => {
  it("requires an exact approved email and password", () => {
    process.env.CLIENT_ADMIN_EMAIL = "client@example.com";
    process.env.CLIENT_ADMIN_PASSWORD = "correct-horse-battery-staple";

    expect(validateClientAdminCredentials("CLIENT@example.com", "correct-horse-battery-staple")).toBe(true);
    expect(validateClientAdminCredentials("visitor@example.com", "correct-horse-battery-staple")).toBe(false);
    expect(validateClientAdminCredentials("client@example.com", "incorrect")).toBe(false);
  });

  it("issues a signed client-admin session for the approved account", async () => {
    process.env.CLIENT_ADMIN_EMAIL = "client@example.com";
    process.env.CLIENT_ADMIN_PASSWORD = "correct-horse-battery-staple";

    await expect(createClientAdminSession("client@example.com")).resolves.toEqual(expect.any(String));
  });
});
