import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { listSessions } from "@/lib/chat/sessions";

export const appRouter = createTRPCRouter({
  sessions: createTRPCRouter({
    list: protectedProcedure.query(({ ctx }) =>
      listSessions({ nucleusId: ctx.userId, authId: ctx.userId }),
    ),
  }),
});

export type AppRouter = typeof appRouter;
