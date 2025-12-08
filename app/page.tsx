import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import Image from "next/image"
import Link from "next/link"
import SignOutButton from "./components/SignOutButton"
import ItineraryForm from "./components/ItineraryForm"

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <div className="flex items-center gap-4 w-full">
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
              <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
                Welcome, {session.user.name}!
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {session.user.email}
              </p>
            </div>
          </div>
          
          <ItineraryForm />
          
          <div className="w-full p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
              Your Itineraries
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Your saved itineraries will appear here.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <SignOutButton />
        </div>
      </main>
    </div>
  )
}
