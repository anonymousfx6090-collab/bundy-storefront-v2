export type AccountRole = "admin" | "user";

/**
 * Only the project owner identity supplied by the platform may hold the admin role.
 * No public sign-in or client request can elevate a user to admin.
 */
export function roleForAccount(openId: string, ownerOpenId: string): AccountRole {
  return openId === ownerOpenId ? "admin" : "user";
}
