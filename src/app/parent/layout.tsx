'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { href: '/parent/dashboard', label: 'Dashboard' },
    { href: '/parent/applications', label: 'Applications' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  pathname === item.href
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <main>{children}</main>
    </div>
  )
} 