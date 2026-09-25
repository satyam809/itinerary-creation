import { getServerSession } from "next-auth"
import { authOptions } from "@/services/auth"
import Image from "next/image"
import Link from "next/link"
import SignOutButton from "@/features/auth/components/SignOutButton"
import ItineraryForm from "@/features/itinerary/components/ItineraryForm"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 py-32 px-16 bg-white dark:bg-black">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            Itinerary System
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Please sign in to access your itineraries
          </p>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Sign In
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center bg-zinc-50 font-sans dark:bg-black">
      <main className="container-fluid py-5 px-3 bg-white dark:bg-black">
        <div className="row w-100">
          <div className="col-12">
            <div className="d-flex align-items-center gap-3 mb-3">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
              <div>
                <h1 className="h4 text-black dark:text-zinc-50 mb-0">Welcome, {session.user.name}!</h1>
                <p className="text-muted mb-0">{session.user.email}</p>
              </div>
            </div>

            <ItineraryForm />
          </div>
        </div>

        <div className="mt-4 d-flex">
          <SignOutButton />
        </div>
      </main>
    </div>
  )
}
