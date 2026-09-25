"use client"

import { useState } from "react"
import DestinationInput from "./DestinationInput"
import ItineraryResult from "./ItineraryResult"

export type ViewItinerary = {
  destination: string
  days: number
  tripType: string
  content: string
}

export default function ItineraryForm({ view = null }: { view?: ViewItinerary | null }) {
  const isView = Boolean(view)
  const [place, setPlace] = useState(view?.destination ?? "")
  const [days, setDays] = useState(view ? String(view.days) : "")
  const [tripType, setTripType] = useState(view?.tripType ?? "")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(view?.content ?? null)
  const [error, setError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isView) return
    setError(null)
    setResult(null)
    setSavedMessage(null)
    setLoading(true)

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: place, days: Number(days), tripType }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        setError(data?.error || "Failed to generate itinerary")
      } else {
        setResult(data.text ?? JSON.stringify(data.raw ?? data))
        if (data.itinerary?.id) {
          setSavedMessage("Itinerary saved.")
        }
      }
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid p-0">
      <div className="row g-3">
        <div className="col-12">
          <div className="card h-100 border-0 mb-3">
            <div className="card-body d-flex flex-column p-3">
              <h2 className="card-title text-center">{isView ? "Saved Trip" : "Plan Your Trip"}</h2>

              <form onSubmit={handleSubmit} className="mt-3">
                <div className="row g-2 align-items-end">
                  <div className="col-12 col-lg-5">
                    <label htmlFor="place" className="form-label">Destination</label>
                    <DestinationInput
                      value={place}
                      onChange={(v) => setPlace(v)}
                      onSelect={(s) => setPlace(s.display_name)}
                      placeholder="Enter destination (e.g., Paris, France)"
                      disabled={isView}
                    />
                  </div>

                  <div className="col-6 col-lg-2">
                    <label htmlFor="days" className="form-label">Days</label>
                    <input
                      type="number"
                      id="days"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      placeholder="#"
                      min={1}
                      max={30}
                      required
                      disabled={isView}
                      className="form-control"
                    />
                  </div>

                  <div className="col-6 col-lg-3">
                    <label htmlFor="tripType" className="form-label">Trip Type</label>
                    <select
                      id="tripType"
                      value={tripType}
                      onChange={(e) => setTripType(e.target.value)}
                      required
                      disabled={isView}
                      className="form-select"
                    >
                      <option value="">Select trip type</option>
                      <option value="adventure">Adventure</option>
                      <option value="relaxation">Relaxation</option>
                      <option value="cultural">Cultural</option>
                      <option value="business">Business</option>
                      <option value="family">Family</option>
                      <option value="romantic">Romantic</option>
                      <option value="backpacking">Backpacking</option>
                    </select>
                  </div>

                  <div className="col-12 col-lg-2 d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary h-100"
                      disabled={loading || isView}
                    >
                      {loading ? "…" : "Go"}
                    </button>
                  </div>
                </div>
              </form>

              {error && (
                <div className="alert alert-danger mt-3">Error: {error}</div>
              )}

              {savedMessage && (
                <div className="alert alert-success mt-3 mb-0">{savedMessage}</div>
              )}

              <div className="mt-auto" />
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card h-100 mb-3">
            <div className="card-body p-3">
              <h2 className="card-title text-center">Generated Itinerary</h2>
              <div className="mt-3">
                <ItineraryResult result={result} destination={place} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// moved parsing/rendering to `ItineraryResult` component
