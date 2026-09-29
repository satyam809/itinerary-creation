import { BUDGETS, DESTINATION_TYPES, optionLabel, TRAVEL_STYLES } from "@/features/itinerary/options"

export type ItineraryPromptInput = {
  destination: string
  numberOfDays: number
  destinationType: string
  travelStyle: string
  budget: string
  startingLocation: string
}

function field(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function jsonText(value: string) {
  return JSON.stringify(value).slice(1, -1)
}

export function buildItineraryPrompt(input: ItineraryPromptInput) {
  const destination = field(input.destination)
  const startingLocation = field(input.startingLocation)
  const destinationType = optionLabel(DESTINATION_TYPES, input.destinationType)
  const travelStyle = optionLabel(TRAVEL_STYLES, input.travelStyle)
  const budget = optionLabel(BUDGETS, input.budget)

  return `You are an expert travel itinerary planner. The itinerary is shown as a responsive day-by-day timeline on phones and desktops, so every line must be short enough to scan.

Trip:
- Destination: ${destination}
- Number of days: ${input.numberOfDays}
- Destination type: ${destinationType}
- Travel style: ${travelStyle}
- Budget: ${budget}
- Starting location: ${startingLocation}

Planning rules:
- Include every day from 1 through ${input.numberOfDays}, in order.
- Split each day into morning, afternoon, and evening.
- Use 2 morning activities, 2 afternoon activities, and 1 or 2 evening activities. Never more than 3 activities in one period.
- Order stops so the traveler stays in one area before moving on. When a transfer is long, mention that time in the activity description.
- Match activities to the destination type, travel style, and budget.
- On short trips, keep only the highest-value experiences.
- Vary the kind of activity across the day.
- Suggest a local food style for the day, not a made-up restaurant name.
- Add one or two practical tips per day, plus a few trip-wide tips.
- Do not invent opening hours, ticket prices, reservation status, or exact fares.
- Write plain sentences. No markdown, headings, or bullet characters inside string values.

Return valid JSON only. Morning, afternoon, and evening items must be objects, never strings. Use this shape:

{
  "destination": "${jsonText(destination)}",
  "summary": "Two sentences on the trip shape, pace, and who it suits.",
  "days": [
    {
      "day": 1,
      "title": "Short theme, six words or fewer",
      "morning": [
        {
          "activity": "Short activity name",
          "duration": "1.5 hours",
          "description": "One sentence on what to do and why this stop fits the day."
        }
      ],
      "afternoon": [],
      "evening": [],
      "places": ["Place name"],
      "foodSuggestions": ["Cuisine or meal style"],
      "travelTips": ["One practical tip"]
    }
  ],
  "generalTips": ["Trip-wide tip"],
  "estimatedBudget": {
    "level": "${jsonText(budget)}",
    "notes": "One sentence on how spending should feel at this budget, without invented prices."
  }
}`
}

/** Keeps model JSON when the reply is valid; otherwise returns the original text. */
export function normalizeGeneratedItinerary(text: string) {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  const candidate = (fenced ? fenced[1] : trimmed).trim()
  const start = candidate.indexOf("{")
  const end = candidate.lastIndexOf("}")
  if (start === -1 || end <= start) return text

  try {
    return JSON.stringify(JSON.parse(candidate.slice(start, end + 1)), null, 2)
  } catch {
    return text
  }
}
