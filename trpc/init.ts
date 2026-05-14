import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";

export const createTRPCContext = async (_opts: { headers: Headers }) => {
  const { userId, orgId } = await auth();
  return { userId, orgId };
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { userId: ctx.userId, orgId: ctx.orgId } });
});
