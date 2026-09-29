import { prisma } from "@/lib/prisma"
import {
  BUDGETS,
  DESTINATION_TYPES,
  isAllowedOption,
  TRAVEL_STYLES,
} from "@/features/itinerary/options"

export class ItineraryValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ItineraryValidationError"
  }
}

export type SaveItineraryInput = {
  email: string
  name?: string | null
  image?: string | null
  destination: string
  days: number
  destinationType: string
  travelStyle: string
  budget: string
  startingLocation: string
  content: string
}

function requireText(value: string, label: string, maxLength: number) {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new ItineraryValidationError(`${label} is required`)
  }
  if (trimmed.length > maxLength) {
    throw new ItineraryValidationError(`${label} must be ${maxLength} characters or fewer`)
  }
  return trimmed
}

function requireOption(
  value: string,
  options: readonly { value: string; label: string }[],
  label: string,
) {
  if (!isAllowedOption(options, value)) {
    throw new ItineraryValidationError(`${label} is not supported`)
  }
  return value
}

export async function saveItinerary(input: SaveItineraryInput) {
  const email = requireText(input.email, "Email", 255)
  const destination = requireText(input.destination, "Destination", 255)
  const startingLocation = requireText(input.startingLocation, "Starting location", 255)
  const destinationType = requireOption(input.destinationType, DESTINATION_TYPES, "Destination type")
  const travelStyle = requireOption(input.travelStyle, TRAVEL_STYLES, "Travel style")
  const budget = requireOption(input.budget, BUDGETS, "Budget")
  const content = input.content.trim()
  const days = Number(input.days)
  const name = input.name?.trim() ? input.name.trim().slice(0, 255) : null
  const image = input.image?.trim() ? input.image.trim().slice(0, 512) : null

  if (!content) {
    throw new ItineraryValidationError("Itinerary content is required")
  }
  if (!Number.isInteger(days) || days < 1 || days > 30) {
    throw new ItineraryValidationError("Days must be a whole number between 1 and 30")
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, image },
    create: { email, name, image },
  })

  return prisma.itinerary.create({
    data: {
      userId: user.id,
      destination,
      days,
      destinationType,
      travelStyle,
      budget,
      startingLocation,
      content,
    },
  })
}

async function findUserIdByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim() },
    select: { id: true },
  })
  return user?.id ?? null
}

export async function listItinerariesByEmail(email: string) {
  const userId = await findUserIdByEmail(email)
  if (!userId) return []

  return prisma.itinerary.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}

export async function getItineraryByIdForEmail(email: string, id: number) {
  if (!Number.isInteger(id) || id < 1) return null

  const userId = await findUserIdByEmail(email)
  if (!userId) return null

  return prisma.itinerary.findFirst({
    where: { id, userId },
  })
}
