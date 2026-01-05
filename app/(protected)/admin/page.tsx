import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UsersTable } from '@/components/UsersTable'
import { AdminPayPalSection } from '@/components/AdminPayPalSection'
import { PayPalInterface, PayPalProduct } from '@/app/actions/paypalActions'

// NOTE: DeprecationWarning originates inside PayPalInterface (uses url.parse).
// Update that module to use the WHATWG URL API (new URL(...)) to clear the warning.

async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) return null

  const payload = AuthService.verifyToken(token)
  if (!payload) return null

  return AuthService.getUserById(payload.id)
}

async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

async function getPayPalCatalog() {
  const paypal = new PayPalInterface()
  return paypal.getItems()
}

export default async function AdminPage() {
  const user = await getCurrentUser()

  // Redirect if not logged in
  if (!user) {
    redirect('/login')
  }

  // Redirect if not admin
  if (!AuthService.isAdmin(user)) {
    redirect('/dashboard')
  }

  const allUsers = await getAllUsers()
  let paypalCatalog: { products: PayPalProduct[]; total_items: number } | null = null
  let paypalError: string | null = null

  try {
    paypalCatalog = await getPayPalCatalog()
  } catch (error) {
    paypalError = error instanceof Error ? error.message : 'Failed to load PayPal catalog'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Manage users and system settings
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">All Users ({allUsers.length})</h2>
        </div>
        
        <UsersTable initialUsers={allUsers} />
      </div>

      <AdminPayPalSection paypalCatalog={paypalCatalog} paypalError={paypalError} />

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {allUsers.length}
          </p>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold mb-2">Admins</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {allUsers.filter((u) => u.role === 'admin').length}
          </p>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold mb-2">Regular Users</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {allUsers.filter((u) => u.role !== 'admin').length}
          </p>
        </div>
      </div>
    </div>
  )
}
