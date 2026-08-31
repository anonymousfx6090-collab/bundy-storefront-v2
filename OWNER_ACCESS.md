# Bundy Owner Access

The **Owner Studio** at `/admin` is deliberately locked. It uses the project’s built-in Manus sign-in flow rather than storing a separate website password.

## How access is controlled

When the Owner Studio is opened, the visitor must sign in. The server then compares that authenticated account’s internal identity with the project’s platform-supplied `OWNER_OPEN_ID` value. Only the matching owner identity receives the `admin` role. Every other signed-in identity receives the `user` role, and the admin catalog procedures reject it.

This means that no public visitor can create an administrator account, change their own role, upload products, or call the protected catalog operations. They can browse published products without creating an account.

## How you sign in

Use the **Sign in as owner** button at `/admin` and authenticate with the same Manus account that owns this project. That account’s existing sign-in credentials are used by the trusted identity provider; Bundy does not keep a separate copy of an email address or password.

If you ever transfer ownership of this project, access should be reviewed before the transfer so the platform owner identity remains the only administrator.
