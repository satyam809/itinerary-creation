import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import ItineraryForm from "@/features/itinerary/components/ItineraryForm"
import { getItineraryByIdForEmail } from "@/features/itinerary/services/saveItinerary"
import { authOptions } from "@/services/auth"

export const dynamic = "force-dynamic"

export default async function CreateItineraryPage({ searchParams }) {
  const params = await searchParams
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const id = rawId ? Number(rawId) : NaN
  const requestedView = Number.isInteger(id) && id > 0

  let view = null
  let missing = false

  if (requestedView) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      redirect("/login")
    }

    const itinerary = await getItineraryByIdForEmail(session.user.email, id)
    if (itinerary) {
      view = {
        destination: itinerary.destination,
        days: itinerary.days,
        tripType: itinerary.tripType,
        content: itinerary.content,
      }
    } else {
      missing = true
    }
  }

  return (
    <main className="p-3 p-md-4">
      <h1 className="h3 mb-4">{view ? "View Itinerary" : "Create Itinerary"}</h1>
      {missing ? (
        <div className="alert alert-warning" role="alert">
          Itinerary not found.
        </div>
      ) : null}
      <ItineraryForm view={view} />
    </main>
  )
}
