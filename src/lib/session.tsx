'use client'

import type { User } from '@prisma/client'
import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'

type SessionContext =
  | {
      isAuthed: false
      user: null,
      refetch: () => void
    }
  | {
      isAuthed: true
      user: Omit<User, "ip">,
      refetch: () => void
    }

const sessionContext = createContext<SessionContext>({
  isAuthed: false,
  user: null,
  refetch: () => {}
})

export const SessionProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [user, setUser] = useState()

  useEffect(() => {
    refetch()
  }, [])

  const refetch = async () => {
    setUser((await api.maze.getSession.get()).data)
  }

  const isAuthed = user !== null
  const value = isAuthed ? { isAuthed, user, refetch } : { isAuthed, user: null, refetch }


  return <sessionContext.Provider value={value}>{children}</sessionContext.Provider>
}

export const useSession = () => {
  const context = useContext(sessionContext)
  if (!context) throw new Error('useSession must be used within a SessionProvider')
  return context
}