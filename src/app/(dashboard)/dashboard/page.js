"use client"

import Image from "next/image"
import { useAuth } from "@/features/auth/components/AuthProvider"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <main className="p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        {user.image && (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={48}
            height={48}
            className="rounded-circle"
          />
        )}
        <div>
          <h1 className="h4 mb-0">Welcome, {user.name}!</h1>
          <p className="text-muted mb-0">{user.email}</p>
        </div>
      </div>
      <p className="text-muted mb-0">
        Use the sidebar to create or browse itineraries.
      </p>
    </main>
  )
}
