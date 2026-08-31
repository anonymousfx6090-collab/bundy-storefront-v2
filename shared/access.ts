export type AccountRole = "admin" | "user";

/** OAuth identities are shoppers only; the client administrator uses a separate password session. */
export function roleForAccount(): AccountRole {
  return "user";
}
