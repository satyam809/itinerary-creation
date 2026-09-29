"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { useAuth } from "@/features/auth/components/AuthProvider"

function GoogleCallback() {
  const params = useSearchParams()
  const router = useRouter()
  const { completeGoogleSignIn } = useAuth()
  const [message, setMessage] = useState("Signing you in...")

  useEffect(() => {
    const token = params.get("token")
    if (!token) {
      router.replace("/login?error=google")
      return
    }

    completeGoogleSignIn(token)
      .then(() => router.replace("/dashboard"))
      .catch(() => {
        setMessage("Sign-in failed")
        router.replace("/login?error=google")
      })
  }, [completeGoogleSignIn, params, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <p className="text-zinc-600 dark:text-zinc-400">{message}</p>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
          <p className="text-zinc-600 dark:text-zinc-400">Signing you in...</p>
        </div>
      }
    >
      <GoogleCallback />
    </Suspense>
  )
}
