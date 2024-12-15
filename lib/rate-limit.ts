import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './cache'
import { NextRequest } from 'next/server'

// Create a new ratelimiter that allows 10 requests per 10 seconds
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
})

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
  error?: string
}

export async function checkRateLimit(
  identifier: string,
  request: NextRequest
): Promise<RateLimitResult> {
  try {
    const { success, limit, remaining, reset } = await rateLimiter.limit(identifier)

    return {
      success,
      limit,
      remaining,
      reset,
    }
  } catch (error) {
    return {
      success: false,
      limit: 0,
      remaining: 0,
      reset: 0,
      error: error instanceof Error ? error.message : 'Rate limit check failed',
    }
  }
}

export function getRateLimitIdentifier(request: NextRequest): string {
  // Get IP from Vercel's headers or fall back to a default
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'
  return `${ip}:${request.nextUrl.pathname}`
}
