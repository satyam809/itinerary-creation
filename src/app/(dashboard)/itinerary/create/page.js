"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import ItineraryForm from "@/features/itinerary/components/ItineraryForm"
import { apiFetch } from "@/services/api"

function CreateItinerary() {
  const params = useSearchParams()
  const rawId = params.get("id")
  const id = rawId ? Number(rawId) : NaN
  const requestedView = Number.isInteger(id) && id > 0
  const [view, setView] = useState(null)
  const [missing, setMissing] = useState(false)
  const [loading, setLoading] = useState(requestedView)

  useEffect(() => {
    if (!requestedView) return
    apiFetch(`/itineraries/${id}`)
      .then((itinerary) => {
        setView({
          destination: itinerary.destination,
          days: itinerary.days,
          destinationType: itinerary.destinationType,
          travelStyle: itinerary.travelStyle,
          budget: itinerary.budget,
          startingLocation: itinerary.startingLocation,
          content: itinerary.content,
        })
      })
      .catch(() => setMissing(true))
      .finally(() => setLoading(false))
  }, [id, requestedView])

  return (
    <main className="p-4">
      <h1 className="h3 mb-4">{view ? "View Itinerary" : "Create Itinerary"}</h1>
      {loading ? <p className="text-muted">Loading...</p> : null}
      {missing ? (
        <div className="alert alert-warning" role="alert">
          Itinerary not found.
        </div>
      ) : null}
      {!loading ? <ItineraryForm view={view} /> : null}
    </main>
  )
}

export default function CreateItineraryPage() {
  return (
    <Suspense fallback={<main className="p-4">Loading...</main>}>
      <CreateItinerary />
    </Suspense>
  )
}
