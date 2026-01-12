import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.redirect('https://themiracle.love')

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