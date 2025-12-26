import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test the database connection
    await prisma.$connect()

    // Create a test user
     await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8lZrHnZKy', // hashed "testpassword"
      },
    })
     await prisma.user.update({
      where: { email: 'seeloveinfinite@gmail.com'},
      data: { role: 'admin' },
    })
    return NextResponse.json({
      message: 'Database connection successful!',
     
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    )
  }
}