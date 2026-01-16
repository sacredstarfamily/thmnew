'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

interface MobileNavProps {
  isAdmin: boolean
}

export function MobileNav({ isAdmin }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        aria-expanded={isOpen}
      >
        <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
        {!isOpen ? (
          <svg
            className="block h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        ) : (
          <svg
            className="block h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed left-0 top-16 w-64 h-screen bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="px-4 py-6 space-y-2">
          <button
            onClick={() => {
              open()
              setIsOpen(false)
            }}
            className={`
              w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${isConnected 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
          >
            {isConnected ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            ) : (
              'Connect Wallet'
            )}
          </button>
          <Link
            href="/dashboard"
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 block px-4 py-2 rounded-md text-base font-medium transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 block px-4 py-2 rounded-md text-base font-medium transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/settings"
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 block px-4 py-2 rounded-md text-base font-medium transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          {isAdmin && (
            <div className="border-t border-gray-200 pt-2 mt-2">
              <Link
                href="/admin"
                className="text-purple-600 hover:text-purple-900 hover:bg-purple-50 block px-4 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Admin Dashboard
              </Link>
            </div>
          )}
          <form action="/api/auth/logout" method="POST">
            <button
              className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
            >
              Logout
            </button>
          </form>
        </nav>
      </div>
    </>
  )
}
