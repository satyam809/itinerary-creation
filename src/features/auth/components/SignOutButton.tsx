"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-zinc-300 px-4 text-sm text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
    >
      Sign Out
    </button>
  )
}
