import { z } from "zod";
import { createCallerFactory, createTRPCRouter, publicProcedure } from "~/server/api/trpc";


let leaderboard: {
  name: string,
  time: number
}[] = []


export const appRouter = createTRPCRouter({
  post: createTRPCRouter({
    putScore: publicProcedure
    .input(z.object({
      name: z.string(),
      time: z.number()
    }))
    .mutation(({ input }) => {
      leaderboard.push(input)
      leaderboard = leaderboard.sort((a, b) => a.time - b.time)
      return "OK";
    })
  }),
  get: createTRPCRouter({
    getLeaderboard: publicProcedure
    .query(() => {
      return leaderboard.slice(0, 10);
    })
  })
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
