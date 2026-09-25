"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 px-8 text-foreground transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 md:w-auto"
    >
      Sign Out
    </button>
  )
}
