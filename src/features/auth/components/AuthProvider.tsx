"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { apiFetch, clearToken, getToken, setToken } from "@/services/api"

export type AuthUser = {
  id: string
  name: string | null
  email: string
  image: string | null
}

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: { name?: string; email: string; password: string }) => Promise<void>
  signOut: () => void
  completeGoogleSignIn: (token: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    apiFetch("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        clearToken()
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    setToken(data.token)
    setUser(data.user)
  }, [])

  const signUp = useCallback(async (input: { name?: string; email: string; password: string }) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    })
    setToken(data.token)
    setUser(data.user)
  }, [])

  const signOut = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const completeGoogleSignIn = useCallback(async (token: string) => {
    setToken(token)
    const data = await apiFetch("/auth/me")
    setUser(data.user)
    setIsLoading(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      signIn,
      signUp,
      signOut,
      completeGoogleSignIn,
    }),
    [user, isLoading, signIn, signUp, signOut, completeGoogleSignIn],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
