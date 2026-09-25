import { TripType } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const TRIP_TYPES = new Set<string>(Object.values(TripType))

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
  tripType: string
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

export async function saveItinerary(input: SaveItineraryInput) {
  const email = requireText(input.email, "Email", 255)
  const destination = requireText(input.destination, "Destination", 255)
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
  if (!TRIP_TYPES.has(input.tripType)) {
    throw new ItineraryValidationError("Trip type is not supported")
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
      tripType: input.tripType as TripType,
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
