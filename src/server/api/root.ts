import { z } from "zod";
import { createCallerFactory, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import profanity from "~/server/api/profanity"

let leaderboard: {
  name: string,
  time: number,
  ip: string
}[] = []

const lastRun: Record<string, number> = {}

const blacklist: Record<string, number> = {}

const addBlacklist = (ip: string) => {
  if (blacklist[ip] !== undefined) {
    blacklist[ip]++
  } else {
    blacklist[ip] = 1
  }
}

export const appRouter = createTRPCRouter({
  post: createTRPCRouter({
    putScore: publicProcedure
      .input(z.object({
        name: z.string(),
        time: z.number()
      }))
      .mutation(({ input, ctx }): [number, string] => {
        const ip = (ctx.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
        if(ip === undefined) return [0, "Couldn't get your IP Address"]

        if (input.time < 7) return [1, "Couldn't upload the score because it's too fast!"]
        if (input.name.length < 3 && input.name !== "") return [0, "The name is too short"]
        if (blacklist[ip] !== undefined) {
          if (blacklist[ip] > 3) return [1, "You have been blacklisted"]
        }
        if (lastRun[ip] !== undefined) {
          if (new Date().getTime() - input.time * 1000 + lastRun[ip] > 0) {
            addBlacklist(ip)
            return [1, "Timestamps mismatch"]
          }
        }
        if (profanity.includes(input.name.toLowerCase())) {
            addBlacklist(ip)
          return [1, "This name contains profanity"]
        }
        leaderboard.push({...input, ip})
        
        leaderboard = leaderboard.sort((a, b) => a.time - b.time)
        const highestScore = leaderboard.filter(s => s.ip === ip)[0]
        leaderboard = leaderboard.filter(s => s.ip !== ip)
        leaderboard.push(highestScore)
        if (ip !== undefined) lastRun[ip] = new Date().getTime()
        return [1, "Successfully reported the score"];
      })
  }),
  get: createTRPCRouter({
    getLeaderboard: publicProcedure
      .input(z.number())
      .query(({ input }) => {
        return {
          results: leaderboard.map(r => { name: r.name, time: r.time}).slice(input * 15, input * 15 + 15),
          maxPage: Math.ceil(leaderboard.length / 15)
        };
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
