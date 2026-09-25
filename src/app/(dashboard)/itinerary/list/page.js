import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import ItineraryResult from "@/features/itinerary/components/ItineraryResult"
import { listItinerariesByEmail } from "@/features/itinerary/services/saveItinerary"
import { authOptions } from "@/services/auth"
import { formatDate } from "@/utils/formatters"

export const dynamic = "force-dynamic"

function tripTypeLabel(tripType) {
  if (!tripType) return ""
  return tripType.charAt(0).toUpperCase() + tripType.slice(1)
}

export default async function ListItineraryPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const itineraries = await listItinerariesByEmail(session.user.email)

  return (
    <main className="p-4">
      <h1 className="h3 mb-4">Itinerary List</h1>

      {itineraries.length === 0 ? (
        <p className="text-muted mb-0">No itineraries yet.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {itineraries.map((itinerary) => (
            <article key={itinerary.id} className="card">
              <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
                  <h2 className="h5 mb-0">{itinerary.destination}</h2>
                  <span className="text-muted small">
                    {formatDate(itinerary.createdAt)}
                  </span>
                </div>
                <p className="text-muted mb-3">
                  {itinerary.days} {itinerary.days === 1 ? "day" : "days"} · {tripTypeLabel(itinerary.tripType)}
                </p>
                <ItineraryResult
                  result={itinerary.content}
                  destination={itinerary.destination}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
