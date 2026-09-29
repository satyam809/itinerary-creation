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

export function buildItineraryPrompt(input: ItineraryPromptInput) {
  const destination = field(input.destination)
  const startingLocation = field(input.startingLocation)
  const destinationType = optionLabel(DESTINATION_TYPES, input.destinationType)
  const travelStyle = optionLabel(TRAVEL_STYLES, input.travelStyle)
  const budget = optionLabel(BUDGETS, input.budget)

  return `You are an expert travel itinerary planner.

Create a practical and engaging travel itinerary based on the following inputs:

Destination: ${destination}
Number of Days: ${input.numberOfDays}
Destination Type: ${destinationType}
Travel Style: ${travelStyle}
Budget: ${budget}
Starting Location: ${startingLocation}

Requirements:
1. Create a day-by-day itinerary for the complete trip.
2. For each day, include:
   - Day title
   - Morning activities
   - Afternoon activities
   - Evening activities
   - Recommended places/attractions
   - Approximate time required for each activity
   - Suggested local food/restaurant type
3. Arrange places logically to minimize unnecessary travel.
4. Don't overload a single day with too many activities.
5. Include realistic travel time between major locations.
6. Prioritize must-visit attractions first.
7. Consider the destination type when selecting activities.
8. Keep the itinerary realistic, useful, and easy to follow.
9. Avoid repeating the same type of activity unless necessary.
10. If the trip duration is short, prioritize the most important experiences.
11. Add practical tips where useful.
12. Do not invent specific opening hours, ticket prices, or availability unless reliable data is provided.

Return the response in valid JSON only.

JSON structure:
{
  "destination": "",
  "summary": "",
  "days": [
    {
      "day": 1,
      "title": "",
      "morning": [],
      "afternoon": [],
      "evening": [],
      "places": [],
      "foodSuggestions": [],
      "travelTips": []
    }
  ],
  "generalTips": [],
  "estimatedBudget": {
    "level": "",
    "notes": ""
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
