"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/components/AuthProvider"

export default function SignOutButton() {
  const { signOut } = useAuth()
  const router = useRouter()

  return (
    <button
      onClick={() => {
        signOut()
        router.push("/login")
      }}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 px-8 text-foreground transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 md:w-auto"
    >
      Sign Out
    </button>
  )
}
