"use client"

import React, { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { BUDGETS, DESTINATION_TYPES, optionLabel, TRAVEL_STYLES } from "@/features/itinerary/options"
import { apiFetch } from "@/services/api"

type Block = { title: string; markdown: string }

type Activity = {
  name: string
  duration: string
  description: string
}

type ItineraryDay = {
  day?: number
  title?: string
  morning?: unknown[]
  afternoon?: unknown[]
  evening?: unknown[]
  places?: unknown[]
  foodSuggestions?: unknown[]
  travelTips?: unknown[]
}

type ItineraryJson = {
  destination?: string
  summary?: string
  days: ItineraryDay[]
  generalTips?: unknown[]
  estimatedBudget?: { level?: string; notes?: string }
}

export type ItineraryTripMeta = {
  destination?: string | null
  days?: string | number | null
  destinationType?: string | null
  travelStyle?: string | null
  budget?: string | null
  startingLocation?: string | null
}

function asList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function firstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim()) return value.trim()
    if (typeof value === "number") return String(value)
  }
  return ""
}

function parseActivity(item: unknown): Activity | null {
  if (typeof item === "string" || typeof item === "number") {
    const name = String(item).trim()
    return name ? { name, duration: "", description: "" } : null
  }
  if (!item || typeof item !== "object") return null

  const record = item as Record<string, unknown>
  const name = firstString(record, ["activity", "name", "title", "place"])
  const duration = firstString(record, ["duration", "time", "timeRequired"])
  const description = firstString(record, ["description", "details", "note"])
  if (!name && !description) return null
  return { name: name || description, duration, description: name ? description : "" }
}

function parseLines(items: unknown[]): string[] {
  return items
    .map((item) => {
      const activity = parseActivity(item)
      if (!activity) return ""
      return [activity.name, activity.duration].filter(Boolean).join(" · ")
    })
    .filter(Boolean)
}

function parseItineraryJson(text: string): ItineraryJson | null {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  const candidate = (fenced ? fenced[1] : trimmed).trim()
  const start = candidate.indexOf("{")
  const end = candidate.lastIndexOf("}")
  if (start === -1 || end <= start) return null

  try {
    const data = JSON.parse(candidate.slice(start, end + 1)) as ItineraryJson
    if (!data || typeof data !== "object" || !Array.isArray(data.days)) return null
    return data
  } catch {
    return null
  }
}

function PeriodColumn({
  label,
  tone,
  items,
}: {
  label: string
  tone: "morning" | "afternoon" | "evening"
  items: unknown[]
}) {
  const activities = items.map(parseActivity).filter((item): item is Activity => Boolean(item))
  if (!activities.length) return null

  return (
    <section className={`itin-period itin-period-${tone}`}>
      <h4 className="itin-period-label">{label}</h4>
      {activities.map((activity, index) => (
        <article className="itin-activity" key={`${activity.name}-${index}`}>
          <div className="itin-activity-head">
            <h5 className="itin-activity-name">{activity.name}</h5>
            {activity.duration ? <span className="itin-duration">{activity.duration}</span> : null}
          </div>
          {activity.description ? <p className="itin-activity-note">{activity.description}</p> : null}
        </article>
      ))}
    </section>
  )
}

function PillList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null
  return (
    <div>
      <h4>{label}</h4>
      <ul className="itin-pills">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function StructuredItinerary({ data, meta }: { data: ItineraryJson; meta: ItineraryTripMeta }) {
  const [activeDay, setActiveDay] = useState(0)
  const budget = data.estimatedBudget
  const tips = parseLines(asList(data.generalTips))
  const destination = data.destination || meta.destination || "Your trip"
  const dayCount = data.days.length || Number(meta.days) || 0
  const chips = [
    dayCount ? `${dayCount} ${dayCount === 1 ? "day" : "days"}` : "",
    meta.destinationType ? optionLabel(DESTINATION_TYPES, meta.destinationType) : "",
    meta.travelStyle ? optionLabel(TRAVEL_STYLES, meta.travelStyle) : "",
    meta.budget ? optionLabel(BUDGETS, meta.budget) : budget?.level || "",
    meta.startingLocation ? `From ${meta.startingLocation}` : "",
  ].filter(Boolean)

  const showDay = (index: number) => {
    setActiveDay(index)
    document.getElementById(`itin-day-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="itin">
      <header className="itin-hero">
        <p className="itin-kicker">Generated itinerary</p>
        <h2>{destination}</h2>
        {data.summary ? <p className="itin-summary">{data.summary}</p> : null}
        {chips.length ? (
          <div className="itin-meta">
            {chips.map((chip, index) => (
              <span className="itin-chip" key={`${chip}-${index}`}>
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {data.days.length > 1 ? (
        <nav className="itin-day-nav" aria-label="Jump to day">
          {data.days.map((day, index) => (
            <button
              type="button"
              key={`${day.day ?? index}-nav`}
              aria-current={activeDay === index ? "true" : undefined}
              onClick={() => showDay(index)}
            >
              Day {day.day ?? index + 1}
            </button>
          ))}
        </nav>
      ) : null}

      {data.days.map((day, index) => {
        const places = parseLines(asList(day.places))
        const food = parseLines(asList(day.foodSuggestions))
        const dayTips = parseLines(asList(day.travelTips))

        return (
          <article className="itin-day" id={`itin-day-${index}`} key={`${day.day ?? index}-${day.title ?? index}`}>
            <header className="itin-day-head">
              <span className="itin-day-index">Day {day.day ?? index + 1}</span>
              {day.title ? <h3>{day.title}</h3> : null}
            </header>
            <div className="itin-periods">
              <PeriodColumn label="Morning" tone="morning" items={asList(day.morning)} />
              <PeriodColumn label="Afternoon" tone="afternoon" items={asList(day.afternoon)} />
              <PeriodColumn label="Evening" tone="evening" items={asList(day.evening)} />
            </div>
            {places.length || food.length || dayTips.length ? (
              <div className="itin-extra">
                <PillList label="Places" items={places} />
                <PillList label="Food" items={food} />
                {dayTips.length ? (
                  <div>
                    <h4>Tips</h4>
                    <ul className="itin-note-list">
                      {dayTips.map((tip, tipIndex) => (
                        <li key={tipIndex}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        )
      })}

      {budget?.level || budget?.notes || tips.length ? (
        <div className="itin-panels">
          {budget?.level || budget?.notes ? (
            <section className="itin-panel">
              <h3>Estimated budget{budget.level ? `: ${budget.level}` : ""}</h3>
              {budget.notes ? <p>{budget.notes}</p> : null}
            </section>
          ) : null}
          {tips.length ? (
            <section className="itin-panel">
              <h3>General tips</h3>
              <ul className="itin-note-list">
                {tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function parseIntoDayBlocks(text: string): Block[] {
  if (!text) return []
  const lines = text.split(/\r?\n/)
  const blocks: { title: string; lines: string[] }[] = []
  let current: { title: string; lines: string[] } | null = null

  const dayHeaderRe = /^\s*(?:Day|DAY)\b\s*\d+/i

  for (const line of lines) {
    if (dayHeaderRe.test(line)) {
      if (current) blocks.push(current)
      current = { title: line.trim(), lines: [line] }
    } else {
      if (!current) {
        current = { title: "Overview", lines: [line] }
      } else {
        current.lines.push(line)
      }
    }
  }

  if (current) blocks.push(current)

  if (blocks.length === 1 && blocks[0].title === "Overview") {
    return []
  }

  return blocks.map((b) => ({ title: b.title, markdown: b.lines.join("\n") }))
}

export default function ItineraryResult({
  result,
  loading = false,
  destination,
  days,
  destinationType,
  travelStyle,
  budget,
  startingLocation,
}: ItineraryTripMeta & { result: string | null; loading?: boolean }) {
  const parsed = result ? parseItineraryJson(result) : null
  const blocks = result && !parsed ? parseIntoDayBlocks(result) : []

  const [images, setImages] = useState<Record<number, string | null>>({})
  const blockKey = blocks.map((block) => block.title).join("|")

  useEffect(() => {
    if (!result || !blocks.length) return
    blocks.forEach(async (b, i) => {
      try {
        const query = encodeURIComponent(`${destination ? destination + " " : ""}${b.title}`)
        const data = await apiFetch(`/photos/search?query=${query}`)
        setImages((prev) => ({ ...prev, [i]: data?.url ?? null }))
      } catch {
        setImages((prev) => ({ ...prev, [i]: null }))
      }
    })
    // blockKey tracks day titles; `blocks` is a new array each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, destination, blockKey])

  if (loading) {
    return (
      <div className="itin-empty" aria-live="polite">
        <p className="mb-1 fw-semibold">Building your day-by-day plan</p>
        <p className="mb-0">Morning, afternoon, and evening stops will appear here.</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="itin-empty">
        <p className="mb-1 fw-semibold">Your itinerary will show up here</p>
        <p className="mb-0">Generate a trip to see each day laid out for phone and desktop.</p>
      </div>
    )
  }

  if (parsed) {
    return (
      <StructuredItinerary
        data={parsed}
        meta={{ destination, days, destinationType, travelStyle, budget, startingLocation }}
      />
    )
  }

  if (blocks.length > 1) {
    return (
      <div>
        {blocks.map((b, i) => (
          <div className="card mb-3" key={i}>
            <div className="card-body">
              <h3 className="h6 mb-2">{b.title}</h3>
              {images[i] ? (
                <img src={images[i] ?? undefined} alt="" className="img-fluid rounded mb-2" />
              ) : null}
              <div className="markdown-container">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {b.markdown}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="markdown-container">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {result}
      </ReactMarkdown>
    </div>
  )
}
