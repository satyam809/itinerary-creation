import { PrismaClient, TripType } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Demo Traveler",
      email: "demo@example.com",
      image: "https://lh3.googleusercontent.com/a/default-user",
      accounts: {
        create: {
          type: "oauth",
          provider: "google",
          providerAccountId: "google-demo-account-001",
          token_type: "Bearer",
          scope: "openid email profile",
        },
      },
    },
  })

  const existingCount = await prisma.itinerary.count({
    where: { userId: user.id },
  })

  if (existingCount === 0) {
    await prisma.itinerary.createMany({
      data: [
        {
          userId: user.id,
          destination: "Paris, France",
          days: 5,
          tripType: TripType.cultural,
          content: `# 5-Day Cultural Trip to Paris

## Day 1
**Morning:** Louvre Museum
**Afternoon:** Seine river walk
**Evening:** Dinner in Le Marais
**Night:** Eiffel Tower lights

## Day 2
**Morning:** Musée d'Orsay
**Afternoon:** Latin Quarter
**Evening:** Café culture near Saint-Germain
**Night:** Seine cruise

## Tips
- Buy museum passes in advance
- Wear comfortable walking shoes
`,
        },
        {
          userId: user.id,
          destination: "Bali, Indonesia",
          days: 7,
          tripType: TripType.relaxation,
          content: `# 7-Day Relaxation Trip to Bali

## Day 1
**Morning:** Arrival and check-in in Ubud
**Afternoon:** Spa and rice terrace stroll
**Evening:** Balinese dinner
**Night:** Early rest

## Day 2
**Morning:** Yoga session
**Afternoon:** Tirta Empul temple visit
**Evening:** Sunset at a quiet café
**Night:** Hotel pool time

## Tips
- Book spa treatments ahead in peak season
- Stay hydrated in the tropical climate
`,
        },
        {
          userId: user.id,
          destination: "Tokyo, Japan",
          days: 4,
          tripType: TripType.adventure,
          content: `# 4-Day Adventure Trip to Tokyo

## Day 1
**Morning:** Shibuya scramble and city walk
**Afternoon:** Meiji Shrine
**Evening:** Shinjuku street food
**Night:** Observation deck views

## Day 2
**Morning:** TeamLab or interactive exhibit
**Afternoon:** Akihabara exploration
**Evening:** Ramen crawl in Ikebukuro
**Night:** Night markets

## Tips
- Get an IC transit card on day one
- Learn a few basic Japanese phrases
`,
        },
      ],
    })
  }

  console.log("Seed complete:")
  console.log(`  User: ${user.email} (${user.id})`)
  console.log(
    `  Itineraries: ${await prisma.itinerary.count({ where: { userId: user.id } })}`,
  )
}

main()
  .catch((error) => {
    console.error("Seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
