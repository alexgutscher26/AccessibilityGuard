import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit, getRateLimitIdentifier } from './lib/rate-limit'
import { logError, logInfo, logWarn } from './lib/logger'

export async function middleware(request: NextRequest) {
  try {
    // Skip rate limiting for static files and non-API routes
    if (!request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.next()
    }

    const identifier = getRateLimitIdentifier(request)
    const rateLimit = await checkRateLimit(identifier, request)

    if (!rateLimit.success) {
      logWarn('Rate limit exceeded', {
        ip: identifier,
        path: request.nextUrl.pathname,
        remaining: rateLimit.remaining,
      })

      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
        },
      })
    }

    logInfo('Request processed', {
      path: request.nextUrl.pathname,
      remaining: rateLimit.remaining,
    })

    const response = NextResponse.next()

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimit.reset.toString())

    return response
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Unknown error in middleware'))
    return NextResponse.next()
  }
}

export const config = {
  matcher: '/api/:path*',
}
