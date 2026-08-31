import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getClientAdminUser } from "../clientAdminAuth";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  user = await getClientAdminUser(opts.req);

  if (!user) {
    try {
      const oauthUser = await sdk.authenticateRequest(opts.req);
      // OAuth sessions are never allowed to administer this client-owned catalog.
      user = oauthUser ? { ...oauthUser, role: "user" } : null;
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
