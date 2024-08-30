import { z } from "zod";
import { createCallerFactory, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import profanity from "./profanity"

let leaderboard: {
  name: string,
  time: number
}[] = []

let blacklist: {
  [key: string]: number
} = {}

export const appRouter = createTRPCRouter({
  post: createTRPCRouter({
    putScore: publicProcedure
      .input(z.object({
        name: z.string(),
        time: z.number()
      }))
      .mutation(({ input, ctx }): [number, string] => {
        const ip = (ctx.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
        if (input.time < 7) return [1, "Couldn't upload the score because it's too fast!"]
        if (input.name.length < 3 && input.name !== "") return [0, "The name is too short"]
        if(ip !== undefined && blacklist[ip] !== undefined){
          if(blacklist[ip] > 3) return [1, "You have been blacklisted"]
        }
        if (profanity.includes(input.name.toLowerCase())) {
          if(ip !== undefined){
            if(blacklist[ip] !== undefined){
              blacklist[ip] ++
            }else{
              blacklist[ip] = 1
            }
          }
          return [1, "This name contains profanity"]
        }
        leaderboard.push(input)
        leaderboard = leaderboard.sort((a, b) => a.time - b.time)
        return [1, "Successfully reported the score"];
      })
  }),
  get: createTRPCRouter({
    getLeaderboard: publicProcedure
      .query(() => {
        return leaderboard;
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
