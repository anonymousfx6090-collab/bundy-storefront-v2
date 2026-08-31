# Deploying Bundy on Vercel

## Recommendation

Bundy can be moved to Vercel, but it is **not a one-click transfer in its present form**. The project is a Vite frontend backed by Express, tRPC, a database, secure cookie sessions, and Manus-managed object storage. Manus hosting is the shorter and lower-risk path because those services are already connected. Vercel is practical only after the server and storage integrations are adapted for Vercel Functions and external infrastructure.

Vercel supports both Vite builds and Express applications. Its Express support runs the app as a Vercel Function, and Vercel Functions scale with traffic rather than running as a permanently listening server. [1] [2]

| Current Bundy component | Can it move directly? | Vercel requirement |
| --- | --- | --- |
| React + Vite storefront | Yes, after routing review | Build the client with Vite and configure SPA rewrites for `/product/:slug` and `/admin`. [1] |
| Express + tRPC API | No | Refactor the server entry point to export the Express app as a Vercel Function instead of relying only on the current long-running listener. [2] |
| Drizzle / MySQL product catalog | No | Provision an externally reachable managed MySQL-compatible database, apply the `products` migration, and configure its connection string as `DATABASE_URL`. |
| Product image uploads | No | Replace the Manus Forge `/manus-storage/` integration with a storage provider accessible from Vercel, such as an S3-compatible bucket or Vercel Blob. Existing image URLs must be migrated. |
| Client admin email/password session | Yes, with configuration | Copy `JWT_SECRET`, `CLIENT_ADMIN_EMAIL`, and `CLIENT_ADMIN_PASSWORD` to Vercel project secrets. Never prefix these values with `VITE_`. [3] |
| Custom domain | Yes | Add and verify the domain in the Vercel project after the application has passed its production tests. |

## Required Migration Work

The project currently uses a Manus-only storage helper: image uploads obtain a Forge presigned URL and saved images are referenced through `/manus-storage/...`. That service is not automatically available to a Vercel deployment. Before deploying, I would replace the helper with an external storage implementation, use the provider’s public or signed delivery URL in the product table, and transfer any existing product images.

The Express entry point also needs a small deployment adaptation. Vercel’s Express documentation supports an application that is exported as the module’s default export; the running HTTP listener is handled by the platform. [2] The tRPC API must stay under `/api/trpc`, while Vite’s SPA fallback must **not** rewrite `/api/*` routes to the frontend.

> Do **not** copy Manus-managed credentials such as `BUILT_IN_FORGE_API_KEY`, `BUILT_IN_FORGE_API_URL`, or the internal OAuth values into Vercel. They are tied to the Manus environment and are not a portable hosting configuration.

## Suggested Deployment Sequence

| Step | Action | Outcome |
| --- | --- | --- |
| 1 | Export the source code to a GitHub repository from the project settings. | Gives Vercel a repository to build from. |
| 2 | Refactor the Express entry for Vercel Functions and add a Vercel routing configuration. | API endpoints and browser deep links both work. |
| 3 | Create an external managed MySQL-compatible database and run the existing Drizzle migration. | The live product catalog has a portable database. |
| 4 | Replace Manus storage with external object storage and migrate images. | Owner uploads continue to work on Vercel. |
| 5 | In Vercel, import the GitHub repository and configure environment variables for **Production**, **Preview**, and **Development** as appropriate. Changes apply to new deployments, not earlier ones. [3] |
| 6 | Set at minimum `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ADMIN_EMAIL`, and `CLIENT_ADMIN_PASSWORD`; add only the new external storage credentials required by the replacement implementation. | Database and single-client admin authentication work without exposing secrets to the browser. |
| 7 | Create a Preview deployment, verify `/`, `/admin`, a product detail URL, owner upload, and the **View on Temu** redirect. | Confirms the full shopper and client-admin paths before launch. |
| 8 | Promote the tested deployment to Production and attach the custom domain. | Publishes the storefront. |

## Important Security and Routing Notes

Vercel encrypts environment variables at rest, but project users with access can view them. Keep production access restricted to the client or trusted maintainers. [3] The client administrator password and `JWT_SECRET` must remain server-only values; a `VITE_` prefix makes a value available during the Vite build and must not be used for secrets. [1]

For the public storefront, Vite single-page-app deep links need a fallback rewrite. Vercel documents this behavior for Vite applications, but Bundy needs a tailored configuration so `/api/trpc` remains an API destination rather than falling through to `index.html`. [1]

## Bottom Line

If the goal is a straightforward launch with the database, image uploads, and client-admin login working now, use the project’s built-in Manus hosting and its custom-domain panel. If the client specifically requires Vercel, the migration is feasible, but it should be treated as a short infrastructure refactor rather than a deployment-button change.

## References

[1]: https://vercel.com/docs/frameworks/frontend/vite "Vite on Vercel"
[2]: https://vercel.com/docs/frameworks/backend/express "Express on Vercel"
[3]: https://vercel.com/docs/environment-variables "Vercel environment variables"
