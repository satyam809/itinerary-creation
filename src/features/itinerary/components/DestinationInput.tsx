"use client"

import React, { useEffect, useRef, useState } from "react"

type Suggestion = {
  place_id?: number
  display_name: string
  lat: string
  lon: string
}

export default function DestinationInput({
  value,
  onChange,
  onSelect,
  placeholder = "Enter destination (e.g., Paris, France)",
  disabled = false,
}: {
  value: string
  onChange: (v: string) => void
  onSelect?: (s: Suggestion) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [query, setQuery] = useState(value || "")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    setQuery(value || "")
  }, [value])

  useEffect(() => {
    if (disabled || !query) {
      setSuggestions([])
      return
    }

    setLoading(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      try {
        const q = encodeURIComponent(query)
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${q}&addressdetails=1&limit=6`
        const resp = await fetch(url, { headers: { Accept: "application/json" } })
        const data = await resp.json()
        const items: Suggestion[] = (data || []).map((d: any) => ({
          place_id: d.place_id,
          display_name: d.display_name,
          lat: d.lat,
          lon: d.lon,
        }))
        setSuggestions(items)
      } catch (err) {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [query, disabled])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return
      if (!(e.target instanceof Node)) return
      if (!ref.current.contains(e.target)) {
        setSuggestions([])
      }
    }

    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  const handleSelect = (s: Suggestion) => {
    setQuery(s.display_name)
    setSuggestions([])
    onChange(s.display_name)
    if (onSelect) onSelect(s)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((prev) => (prev === null ? 0 : Math.min(suggestions.length - 1, prev + 1)))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((prev) => (prev === null ? suggestions.length - 1 : Math.max(0, prev - 1)))
    } else if (e.key === "Enter") {
      if (active !== null) {
        e.preventDefault()
        handleSelect(suggestions[active])
      }
    }
  }

  return (
    <div className="position-relative" ref={ref}>
      <input
        type="text"
        className="form-control"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value)
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-expanded={suggestions.length > 0}
        disabled={disabled}
        readOnly={disabled}
      />

      {suggestions.length > 0 && (
        <ul
          className="list-group position-absolute w-100 shadow-sm rounded"
          style={{ zIndex: 2000, maxHeight: 240, overflowY: "auto", top: "calc(100% + 0.25rem)" }}
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.place_id ?? `${s.lat}-${s.lon}-${i}`}
              className={`list-group-item list-group-item-action ${i === active ? "active" : ""}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                // use onMouseDown to avoid blur before click
                e.preventDefault()
                handleSelect(s)
              }}
              style={{ cursor: "pointer" }}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}

      {loading && (
        <div className="position-absolute" style={{ right: 8, top: 8 }}>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        </div>
      )}
    </div>
  )
}
