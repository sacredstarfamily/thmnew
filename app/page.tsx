import Image from "next/image";
import Link from "next/link";
import { cookies } from 'next/headers'
import { AuthService } from '@/lib/auth'
import PayButton from "@/components/PayButton";
async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) return null

  const payload = AuthService.verifyToken(token)
  if (!payload) return null

  return AuthService.getUserById(payload.id)
}

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          
          src="/wordlogo.png"
          alt="themiracle word logo"
          width={300}
          height={50}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left max-w-2xl">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            {user ? `Welcome back, ${user.name || user.email.split('@')[0]}!` : "Welcome to our app!"}
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {user
              ? "You're successfully logged in. Access your dashboard, update your profile, or explore all features."
              : "Get started by creating an account or signing in to access all features of our modern web application."
            }
          </p>
            <PayButton />
          {user && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Authenticated
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Member since {new Date(user.createdAt).getFullYear()}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full max-w-md">
          {user ? (
            <>
              <Link
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700 md:flex-1"
                href="/dashboard"
              >
                🏠 Dashboard
              </Link>
              <Link
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/8 px-5 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:flex-1"
                href="/profile"
              >
                👤 Profile
              </Link>
              <Link
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/8 px-5 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:flex-1"
                href="/settings"
              >
                ⚙️ Settings
              </Link>
            </>
          ) : (
            <>
              <Link
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700 md:flex-1"
                href="/signup"
              >
                Get Started
              </Link>
              <Link
                className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/8 px-5 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:flex-1"
                href="/login"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

      </main>
    </div>
  );
}