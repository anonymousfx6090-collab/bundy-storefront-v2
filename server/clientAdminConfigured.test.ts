import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { CLIENT_ADMIN_COOKIE, createClientAdminSession, getClientAdminUser } from "./clientAdminAuth";
import type { TrpcContext } from "./_core/context";

describe("configured client administrator login", () => {
  it("accepts the protected configured credentials and issues an admin session", async () => {
    const email = process.env.CLIENT_ADMIN_EMAIL;
    const password = process.env.CLIENT_ADMIN_PASSWORD;
    expect(email, "CLIENT_ADMIN_EMAIL must be configured").toBeTruthy();
    expect(password, "CLIENT_ADMIN_PASSWORD must be configured").toBeTruthy();

    const cookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
    const ctx = {
      user: null,
      req: { protocol: "https", headers: {} },
      res: {
        cookie: (name: string, value: string, options: Record<string, unknown>) => cookies.push({ name, value, options }),
      },
    } as TrpcContext;

    const result = await appRouter.createCaller(ctx).clientAdminAuth.signIn({ email: email!, password: password! });

    expect(result).toEqual({ success: true });
    expect(cookies).toHaveLength(1);
    expect(cookies[0]?.name).toBe(CLIENT_ADMIN_COOKIE);
    expect(cookies[0]?.value).toEqual(expect.any(String));
    expect(cookies[0]?.options).toMatchObject({ httpOnly: true, secure: true, sameSite: "none" });
  });

  it("resolves a configured client-admin session as the only administrator identity", async () => {
    const email = process.env.CLIENT_ADMIN_EMAIL!;
    const token = await createClientAdminSession(email);
    const user = await getClientAdminUser({ headers: { cookie: `${CLIENT_ADMIN_COOKIE}=${token}` } } as never);

    expect(user).toMatchObject({ email, role: "admin", loginMethod: "client-password" });
  });
});
