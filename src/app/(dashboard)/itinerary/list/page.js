import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { listItinerariesByEmail } from "@/features/itinerary/services/saveItinerary"
import { authOptions } from "@/services/auth"
import { formatDate } from "@/utils/formatters"

export const dynamic = "force-dynamic"

function tripTypeLabel(tripType) {
  if (!tripType) return ""
  return tripType.charAt(0).toUpperCase() + tripType.slice(1)
}

function ViewIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
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
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Destination</th>
                <th scope="col">Days</th>
                <th scope="col">Trip Type</th>
                <th scope="col">Created</th>
                <th scope="col" className="text-end">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {itineraries.map((itinerary) => (
                <tr key={itinerary.id}>
                  <td>{itinerary.destination}</td>
                  <td>
                    {itinerary.days} {itinerary.days === 1 ? "day" : "days"}
                  </td>
                  <td>{tripTypeLabel(itinerary.tripType)}</td>
                  <td>{formatDate(itinerary.createdAt)}</td>
                  <td className="text-end">
                    <Link
                      href={`/itinerary/create?id=${itinerary.id}`}
                      className="btn btn-outline-primary btn-sm d-inline-flex align-items-center justify-content-center"
                      aria-label={`View ${itinerary.destination}`}
                      title="View"
                    >
                      <ViewIcon />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
