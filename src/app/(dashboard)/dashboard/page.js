import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import { authOptions } from "@/services/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <main className="p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={48}
            height={48}
            className="rounded-circle"
          />
        )}
        <div>
          <h1 className="h4 mb-0">Welcome, {session.user.name}!</h1>
          <p className="text-muted mb-0">{session.user.email}</p>
        </div>
      </div>
      <p className="text-muted mb-0">
        Use the sidebar to create or browse itineraries.
      </p>
    </main>
  )
}
