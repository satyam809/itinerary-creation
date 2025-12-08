"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

export default function ItineraryForm() {
  const [place, setPlace] = useState("")
  const [days, setDays] = useState("")
  const [tripType, setTripType] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
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
      }
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid py-4 px-3">
      <div className="row g-3">
        <div className="col-12">
          <div className="card h-100 border-0">
            <div className="card-body d-flex flex-column">
              <h2 className="card-title text-center">Plan Your Trip</h2>

              <form onSubmit={handleSubmit} className="mt-3">
                <div className="row g-2 align-items-end">
                  <div className="col-12 col-md-6">
                    <label htmlFor="place" className="form-label">Destination</label>
                    <input
                      type="text"
                      id="place"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="Enter destination (e.g., Paris, France)"
                      required
                      className="form-control"
                    />
                  </div>

                  <div className="col-6 col-md-2">
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
                      className="form-control"
                    />
                  </div>

                  <div className="col-6 col-md-3">
                    <label htmlFor="tripType" className="form-label">Trip Type</label>
                    <select
                      id="tripType"
                      value={tripType}
                      onChange={(e) => setTripType(e.target.value)}
                      required
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

                  <div className="col-12 col-md-1 d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary h-100"
                      disabled={loading}
                    >
                      {loading ? "…" : "Go"}
                    </button>
                  </div>
                </div>
              </form>

              {error && (
                <div className="alert alert-danger mt-3">Error: {error}</div>
              )}

              <div className="mt-auto" />
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="card-title">Generated Itinerary</h2>
              <div className="mt-3">
                {result ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {result}
                  </ReactMarkdown>
                ) : (
                  <p className="text-muted">Your generated itinerary will appear here after you create it.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
