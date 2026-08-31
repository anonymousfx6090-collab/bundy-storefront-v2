import { describe, expect, it, vi } from "vitest";
import { roleForAccount } from "../shared/access";
import { isTemuLink, safeImageFilename, toProductSlug } from "../shared/catalog";

vi.mock("./db", () => ({
  listAllProducts: vi.fn().mockResolvedValue([]),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("catalog helpers", () => {
  it("assigns admin privileges only to the designated owner identity", () => {
    expect(roleForAccount()).toBe("user");
  });

  it("creates compact, URL-safe product slugs", () => {
    expect(toProductSlug("  Red / Blue Dress!  ")).toBe("red-blue-dress");
  });

  it("accepts Temu product and short links while rejecting unrelated URLs", () => {
    expect(isTemuLink("https://www.temu.com/product.html")).toBe(true);
    expect(isTemuLink("https://temu.to/a1b2c3")).toBe(true);
    expect(isTemuLink("https://example.com/temu")).toBe(false);
  });

  it("makes uploaded image filenames storage-safe", () => {
    expect(safeImageFilename("Look 01 (Blue).JPG")).toBe("look-01-blue-.jpg");
  });

  it("does not allow a non-owner to use the catalog management router", async () => {
    const ctx = {
      user: {
        id: 2,
        openId: "shopper",
        name: "Shopper",
        email: "shopper@example.com",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { headers: {}, protocol: "https" },
      res: {},
    } as TrpcContext;

    await expect(appRouter.createCaller(ctx).catalog.admin.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("allows the designated owner through the protected catalog router", async () => {
    const ctx = {
      user: {
        id: 1,
        openId: "owner-open-id",
        name: "Owner",
        email: "owner@example.com",
        loginMethod: "manus",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { headers: {}, protocol: "https" },
      res: {},
    } as TrpcContext;

    await expect(appRouter.createCaller(ctx).catalog.admin.list()).resolves.toEqual([]);
  });
});
