export const DESTINATION_TYPES = [
  { value: "beach", label: "Beach" },
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "countryside", label: "Countryside" },
  { value: "island", label: "Island" },
  { value: "desert", label: "Desert" },
  { value: "historical", label: "Historical" },
  { value: "wildlife", label: "Wildlife" },
] as const

export const TRAVEL_STYLES = [
  { value: "adventure", label: "Adventure" },
  { value: "relaxation", label: "Relaxation" },
  { value: "cultural", label: "Cultural" },
  { value: "business", label: "Business" },
  { value: "family", label: "Family" },
  { value: "romantic", label: "Romantic" },
  { value: "backpacking", label: "Backpacking" },
  { value: "luxury", label: "Luxury" },
  { value: "food", label: "Food" },
  { value: "sightseeing", label: "Sightseeing" },
] as const

export const BUDGETS = [
  { value: "budget", label: "Budget" },
  { value: "mid-range", label: "Mid-range" },
  { value: "luxury", label: "Luxury" },
  { value: "flexible", label: "Flexible" },
] as const

type Option = { value: string; label: string }

export function optionLabel(options: readonly Option[], value: string) {
  const match = options.find((option) => option.value === value)
  if (match) return match.label
  if (!value) return ""
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function isAllowedOption(options: readonly Option[], value: unknown): value is string {
  return typeof value === "string" && options.some((option) => option.value === value)
}
