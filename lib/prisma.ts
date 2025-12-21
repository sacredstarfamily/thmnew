import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL!

// Connection pooling configuration for optimal performance
const pool = new Pool({
  connectionString,
  // Maximum number of clients in the pool
  max: parseInt(process.env.DATABASE_POOL_MAX || '20'),
  // Minimum number of clients in the pool
  min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  // Maximum time to wait for a connection from the pool (ms)
  connectionTimeoutMillis: 20000,
  // Maximum time a client can be idle before being closed (ms)
  idleTimeoutMillis: 30000,
  // Maximum time to wait for a query to complete (ms)
  query_timeout: 20000,
  // Allow exiting the process even if there are active connections
  allowExitOnIdle: true,
})

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown handling (only in Node.js environment)
if (typeof process !== 'undefined' && process.on) {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
    await pool.end()
  })
}