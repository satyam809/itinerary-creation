"use client"

import { useState } from "react"
import DestinationInput from "./DestinationInput"
import ItineraryResult from "./ItineraryResult"
import { BUDGETS, DESTINATION_TYPES, TRAVEL_STYLES } from "@/features/itinerary/options"
import { apiFetch } from "@/services/api"

export type ViewItinerary = {
  destination: string
  days: number
  destinationType: string
  travelStyle: string
  budget: string
  startingLocation: string
  content: string
}

const selectClass = "form-select"

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly { value: string; label: string }[]
  placeholder: string
  disabled: boolean
}) {
  const known = options.some((option) => option.value === value)

  return (
    <div>
      <label htmlFor={id} className="form-label">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={disabled}
        className={selectClass}
      >
        <option value="">{placeholder}</option>
        {!known && value ? <option value={value}>{value}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function ItineraryForm({ view = null }: { view?: ViewItinerary | null }) {
  const isView = Boolean(view)
  const [destination, setDestination] = useState(view?.destination ?? "")
  const [numberOfDays, setNumberOfDays] = useState(view ? String(view.days) : "")
  const [destinationType, setDestinationType] = useState(view?.destinationType ?? "")
  const [travelStyle, setTravelStyle] = useState(view?.travelStyle ?? "")
  const [budget, setBudget] = useState(view?.budget ?? "")
  const [startingLocation, setStartingLocation] = useState(view?.startingLocation ?? "")
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
      const data = await apiFetch("/itineraries/generate", {
        method: "POST",
        body: JSON.stringify({
          destination,
          numberOfDays: Number(numberOfDays),
          destinationType,
          travelStyle,
          budget,
          startingLocation,
        }),
      })

      setResult(data.text ?? JSON.stringify(data.raw ?? data))
      if (data.itinerary?.id) {
        setSavedMessage("Itinerary saved.")
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
          <div className="card h-100 border-0 mb-3">
            <div className="card-body d-flex flex-column p-3">
              <h2 className="card-title text-center">{isView ? "Saved Trip" : "Plan Your Trip"}</h2>

              <form onSubmit={handleSubmit} className="mt-3">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="destination" className="form-label">Destination</label>
                    <DestinationInput
                      id="destination"
                      value={destination}
                      onChange={setDestination}
                      onSelect={(s) => setDestination(s.display_name)}
                      placeholder="Enter destination (e.g., Paris, France)"
                      disabled={isView}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="startingLocation" className="form-label">Starting Location</label>
                    <DestinationInput
                      id="startingLocation"
                      value={startingLocation}
                      onChange={setStartingLocation}
                      onSelect={(s) => setStartingLocation(s.display_name)}
                      placeholder="City you are departing from"
                      disabled={isView}
                      required
                    />
                  </div>

                  <div className="col-6 col-md-3">
                    <label htmlFor="numberOfDays" className="form-label">Number of Days</label>
                    <input
                      type="number"
                      id="numberOfDays"
                      value={numberOfDays}
                      onChange={(e) => setNumberOfDays(e.target.value)}
                      placeholder="#"
                      min={1}
                      max={30}
                      required
                      disabled={isView}
                      className="form-control"
                    />
                  </div>

                  <div className="col-6 col-md-3">
                    <SelectField
                      id="destinationType"
                      label="Destination Type"
                      value={destinationType}
                      onChange={setDestinationType}
                      options={DESTINATION_TYPES}
                      placeholder="Select type"
                      disabled={isView}
                    />
                  </div>

                  <div className="col-6 col-md-3">
                    <SelectField
                      id="travelStyle"
                      label="Travel Style"
                      value={travelStyle}
                      onChange={setTravelStyle}
                      options={TRAVEL_STYLES}
                      placeholder="Select style"
                      disabled={isView}
                    />
                  </div>

                  <div className="col-6 col-md-3">
                    <SelectField
                      id="budget"
                      label="Budget"
                      value={budget}
                      onChange={setBudget}
                      options={BUDGETS}
                      placeholder="Select budget"
                      disabled={isView}
                    />
                  </div>

                  {!isView ? (
                    <div className="col-12 d-flex justify-content-end">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Generating…" : "Generate"}
                      </button>
                    </div>
                  ) : null}
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
          <div className="card border-0 mb-3">
            <div className="card-body p-2 p-md-3">
              <ItineraryResult
                result={result}
                loading={loading}
                destination={destination}
                days={numberOfDays}
                destinationType={destinationType}
                travelStyle={travelStyle}
                budget={budget}
                startingLocation={startingLocation}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
