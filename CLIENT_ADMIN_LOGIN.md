# Client Administrator Login

Bundy provides exactly **one pre-created client administrator account**. There is no public registration page and there is no route through which a visitor can grant themselves access.

To configure the account, set the protected project secrets `CLIENT_ADMIN_EMAIL` and `CLIENT_ADMIN_PASSWORD`. The client then visits `/admin`, enters those credentials, and receives an eight-hour, HTTP-only administrator session. The password is stored as a protected project secret and is never included in the repository, browser code, or catalog data.

The public storefront remains accessible without an account. Regular OAuth identities, including the project owner identity, are treated as standard users and cannot access catalog-management procedures. Only the signed session created from the configured client credentials is granted the administrator role.

To rotate access, replace `CLIENT_ADMIN_PASSWORD` in the project’s secret settings. Existing administrator sessions naturally expire after eight hours; the client can also use **Sign out** immediately.
