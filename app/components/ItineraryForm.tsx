"use client"

import { useState } from "react"

export default function ItineraryForm() {
  const [place, setPlace] = useState("")
  const [days, setDays] = useState("")
  const [tripType, setTripType] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log({ place, days, tripType })
    // TODO: Add API call to save itinerary
  }

  return (
    <div className="w-full p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
        Plan Your Trip
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="place"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Destination
          </label>
          <input
            type="text"
            id="place"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Enter destination (e.g., Paris, France)"
            required
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
          />
        </div>

        <div>
          <label
            htmlFor="days"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Number of Days
          </label>
          <input
            type="number"
            id="days"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="Enter number of days"
            min="1"
            max="30"
            required
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
          />
        </div>

        <div>
          <label
            htmlFor="tripType"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Trip Type
          </label>
          <select
            id="tripType"
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
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

        <button
          type="submit"
          className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 focus:ring-offset-2"
        >
          Create Itinerary
        </button>
      </form>
    </div>
  )
}
