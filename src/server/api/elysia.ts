import Elysia, { type ElysiaConfig } from 'elysia'
import {ip} from "elysia-ip"
import { db } from '@/server/db'
import * as bip39 from "bip39"

const createContext = new Elysia()
  .use(ip())
  .derive(() => {
    return { db }
  })
  .derive(async ({ db, ip }) => {
    let user = await db.user.findUnique({ where: { ip: ip } })
    if(user === null){
      user = await db.user.create({ data: {
        name: "No name set",
        ip: ip,
        blockWarnings: 0,
        wordPassword: bip39.generateMnemonic()
      } })
    }
    return { user }
  })
  .as('plugin')

export const createElysia = <P extends string, S extends boolean>(c?: ElysiaConfig<P, S>) =>
  new Elysia(c).use(createContext)