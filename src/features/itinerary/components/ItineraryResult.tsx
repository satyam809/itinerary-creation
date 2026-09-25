"use client"

import React, { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

type Block = { title: string; markdown: string }

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
  const accessKey = typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY as string | undefined) : undefined
  const useUnsplash = Boolean(accessKey)
  const blocks = result ? parseIntoDayBlocks(result) : []

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
