import { z } from "zod";
import { isTemuLink, safeImageFilename } from "../shared/catalog";
import { CLIENT_ADMIN_COOKIE, CLIENT_ADMIN_SESSION_SECONDS, createClientAdminSession, hasClientAdminCredentials, validateClientAdminCredentials } from "./clientAdminAuth";
import * as db from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

const productInput = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().min(10).max(1200),
  price: z.number().positive().max(10_000_000),
  currency: z.string().trim().length(3).transform(value => value.toUpperCase()),
  category: z.string().trim().min(2).max(80),
  imageUrl: z.string().trim().min(1).refine(value => value.startsWith("/") || /^https?:\/\//.test(value), "Use an uploaded image or a valid image URL."),
  imageAlt: z.string().trim().min(4).max(240),
  temuUrl: z.string().url().refine(isTemuLink, "Use a direct Temu or Temu affiliate link."),
  status: z.enum(["active", "sold-out", "inactive"]),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(CLIENT_ADMIN_COOKIE, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  clientAdminAuth: router({
    signIn: publicProcedure
      .input(z.object({ email: z.string().email().max(320), password: z.string().min(1).max(256) }))
      .mutation(async ({ input, ctx }) => {
        if (!hasClientAdminCredentials() || !validateClientAdminCredentials(input.email, input.password)) {
          throw new Error("Invalid email or password.");
        }
        const session = await createClientAdminSession(input.email);
        ctx.res.cookie(CLIENT_ADMIN_COOKIE, session, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: CLIENT_ADMIN_SESSION_SECONDS * 1000,
        });
        return { success: true } as const;
      }),
  }),
  catalog: router({
    list: publicProcedure.query(() => db.listPublishedProducts()),
    categories: publicProcedure.query(() => db.listProductCategories()),
    bySlug: publicProcedure.input(z.object({ slug: z.string().min(1).max(120) })).query(({ input }) => db.getPublishedProductBySlug(input.slug)),
    admin: router({
      list: adminProcedure.query(() => db.listAllProducts()),
      create: adminProcedure.input(productInput).mutation(({ input }) => db.createProduct(input)),
      update: adminProcedure.input(z.object({ id: z.number().int().positive(), product: productInput })).mutation(({ input }) => db.updateProduct(input.id, input.product)),
      remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => db.removeProduct(input.id)),
      uploadImage: adminProcedure
        .input(z.object({ filename: z.string().min(1).max(160), dataUrl: z.string().min(100) }))
        .mutation(async ({ input, ctx }) => {
          const image = input.dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
          if (!image) throw new Error("Upload a PNG, JPEG, or WebP image.");
          const bytes = Buffer.from(image[2], "base64");
          if (bytes.byteLength > 3 * 1024 * 1024) throw new Error("Images must be 3 MB or smaller.");
          const key = `products/${ctx.user.id}/${Date.now()}-${safeImageFilename(input.filename)}`;
          return storagePut(key, bytes, image[1]);
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
