import { createElysia } from '@/server/api/elysia'
import routes from '@/server/api/routes'

export const appRouter = createElysia({ prefix: '/api' }).use(routes).compile()

export type App = typeof appRouter