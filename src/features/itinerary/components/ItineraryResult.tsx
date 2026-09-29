"use client"

import React, { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

type Block = { title: string; markdown: string }

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

function asList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function itemText(item: unknown): string {
  if (typeof item === "string") return item
  if (typeof item === "number") return String(item)
  if (!item || typeof item !== "object") return ""

  const record = item as Record<string, unknown>
  const name = [record.activity, record.name, record.title, record.place].find((value) => typeof value === "string")
  const duration = [record.duration, record.time, record.timeRequired].find((value) => typeof value === "string")
  const description = typeof record.description === "string" ? record.description : ""
  const heading = [name, duration].filter(Boolean).join(" · ")
  return [heading, description].filter(Boolean).join(" — ")
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

function DaySection({ label, items }: { label: string; items: unknown[] }) {
  const lines = items.map(itemText).filter(Boolean)
  if (!lines.length) return null
  return (
    <div className="mb-3">
      <h4 className="h6 mb-1">{label}</h4>
      <ul className="mb-0 ps-3">
        {lines.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    </div>
  )
}

function StructuredItinerary({ data }: { data: ItineraryJson }) {
  const budget = data.estimatedBudget
  const tips = asList(data.generalTips).map(itemText).filter(Boolean)

  return (
    <div>
      {data.summary ? <p>{data.summary}</p> : null}
      {data.days.map((day, index) => (
        <div className="card mb-3" key={`${day.day ?? index}-${day.title ?? index}`}>
          <div className="card-body">
            <h3 className="h5 mb-3">
              Day {day.day ?? index + 1}
              {day.title ? `: ${day.title}` : ""}
            </h3>
            <DaySection label="Morning" items={asList(day.morning)} />
            <DaySection label="Afternoon" items={asList(day.afternoon)} />
            <DaySection label="Evening" items={asList(day.evening)} />
            <DaySection label="Places" items={asList(day.places)} />
            <DaySection label="Food" items={asList(day.foodSuggestions)} />
            <DaySection label="Tips" items={asList(day.travelTips)} />
          </div>
        </div>
      ))}
      {budget?.level || budget?.notes ? (
        <div className="card mb-3">
          <div className="card-body">
            <h3 className="h6 mb-2">Estimated budget{budget.level ? `: ${budget.level}` : ""}</h3>
            {budget.notes ? <p className="mb-0">{budget.notes}</p> : null}
          </div>
        </div>
      ) : null}
      {tips.length ? (
        <div className="card mb-3">
          <div className="card-body">
            <h3 className="h6 mb-2">General tips</h3>
            <ul className="mb-0 ps-3">
              {tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
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

export default function ItineraryResult({ result, destination }: { result: string | null; destination?: string | null }) {
  const parsed = result ? parseItineraryJson(result) : null
  const accessKey = typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY as string | undefined) : undefined
  const useUnsplash = Boolean(accessKey)
  const blocks = result && !parsed ? parseIntoDayBlocks(result) : []

  const [images, setImages] = useState<Record<number, string | null>>({})

  useEffect(() => {
    if (!result || !useUnsplash) return
    // fetch one image per block
    blocks.forEach(async (b, i) => {
      try {
        const query = encodeURIComponent(`${destination ? destination + ' ' : ''}${b.title}`)
        const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=1`
        const res = await fetch(url, { headers: { Authorization: `Client-ID ${accessKey}` } })
        if (!res.ok) return
        const data = await res.json()
        const first = data?.results?.[0]
        if (first && first.urls && first.urls.small) {
          setImages((prev) => ({ ...prev, [i]: first.urls.small }))
        } else {
          setImages((prev) => ({ ...prev, [i]: null }))
        }
      } catch (e) {
        setImages((prev) => ({ ...prev, [i]: null }))
      }
    })
  }, [result, destination, useUnsplash, accessKey])

  if (!result) {
    return <p className="text-muted">Your generated itinerary will appear here after you create it.</p>
  }

  if (parsed) {
    return <StructuredItinerary data={parsed} />
  }

  if (blocks.length > 1) {
    return (
      <div>
        {blocks.map((b, i) => (
          <div className="card mb-3" key={i}>
            <div className="card-body">
              <h3 className="h6 mb-2">{b.title}</h3>
              {useUnsplash && images[i] ? (
                <img src={images[i] ?? undefined} alt={`${b.title} image`} className="img-fluid rounded mb-2" />
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
