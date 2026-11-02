import { NextResponse } from "next/server"
import { createHash } from "crypto"
import { headers } from "next/headers"

// In-memory rate limiter (per serverless instance)
// Using a Map with IP -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_MAX_ATTEMPTS = 5 // Max attempts per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute window
const LOCKOUT_DURATION_MS = 5 * 60 * 1000 // 5 minute lockout after exceeding

function getClientIp(headersList: Headers): string {
  // Vercel provides client IP via x-forwarded-for
  const forwarded = headersList.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  const realIp = headersList.get("x-real-ip")
  if (realIp) {
    return realIp
  }
  return "unknown"
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  // Clean up expired entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }

  if (!record || now > record.resetTime) {
    // First attempt or window expired — start fresh
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true }
  }

  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    // Already exceeded — apply lockout
    if (record.resetTime <= now + RATE_LIMIT_WINDOW_MS) {
      // Extend lockout
      record.resetTime = now + LOCKOUT_DURATION_MS
    }
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000)
    return { allowed: false, retryAfterSeconds }
  }

  // Increment attempt count
  record.count++
  return { allowed: true }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const ip = getClientIp(headersList)

    // Check rate limit
    const { allowed, retryAfterSeconds } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Terlalu banyak percobaan. Silakan coba lagi nanti.",
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
          },
        }
      )
    }

    const { password } = await request.json()

    if (!password || typeof password !== "string") {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    const correctPassword = process.env.MOCKUP_PASSWORD
    if (!correctPassword) {
      return NextResponse.json({ success: false, error: "Server misconfigured" }, { status: 500 })
    }

    // Constant-time comparison using hash to prevent timing attacks
    const inputHash = createHash("sha256").update(password).digest("hex")
    const correctHash = createHash("sha256").update(correctPassword).digest("hex")

    if (inputHash === correctHash) {
      // Reset rate limit on successful login
      rateLimitMap.delete(ip)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }
}
