import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const origin = new URL(request.url).origin
  const response = NextResponse.redirect(new URL('/', origin))

  // Clear the auth token cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })

  return response
}