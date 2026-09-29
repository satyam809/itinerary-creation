const LIMIT = 100
const WINDOW_MS = 60_000

export type RateLimitDecision = {
  allowed: boolean
  limit: number
  remaining: number
  retryAfterSeconds: number
}

type Bucket = {
  count: number
  resetAt: number
}

const globalStore = globalThis as typeof globalThis & {
  __rateLimitBuckets?: Map<string, Bucket>
}

function buckets() {
  if (!globalStore.__rateLimitBuckets) {
    globalStore.__rateLimitBuckets = new Map()
  }
  return globalStore.__rateLimitBuckets
}

/** Allows 100 requests per minute for `key`. Counts live in memory only. */
export function consumeRateLimit(key: string): RateLimitDecision {
  const now = Date.now()
  const store = buckets()
  const current = store.get(key)

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return {
      allowed: true,
      limit: LIMIT,
      remaining: LIMIT - 1,
      retryAfterSeconds: 60,
    }
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000))

  if (current.count >= LIMIT) {
    return {
      allowed: false,
      limit: LIMIT,
      remaining: 0,
      retryAfterSeconds,
    }
  }

  current.count += 1
  return {
    allowed: true,
    limit: LIMIT,
    remaining: LIMIT - current.count,
    retryAfterSeconds,
  }
}

export function rateLimitHeaders(decision: RateLimitDecision): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(decision.limit),
    "X-RateLimit-Remaining": String(decision.remaining),
    "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + decision.retryAfterSeconds),
  }
  if (!decision.allowed) {
    headers["Retry-After"] = String(decision.retryAfterSeconds)
  }
  return headers
}

export function rateLimitMessage(decision: RateLimitDecision) {
  const wait = decision.retryAfterSeconds === 1 ? "1 second" : `${decision.retryAfterSeconds} seconds`
  return `Only ${decision.limit} requests are allowed per minute. Try again in ${wait}.`
}
