'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Briefcase, Bookmark, FileText, User } from 'lucide-react'

export default function CandidateMobileNav() {
    const pathname = usePathname()

    const navItems = [
        { href: '/candidate/home', label: 'Home', icon: Home },
        { href: '/candidate/jobs', label: 'Jobs', icon: Briefcase },
        { href: '/candidate/saved', label: 'Saved', icon: Bookmark },
        { href: '/candidate/applied', label: 'Applied', icon: FileText },
        { href: '/candidate/profile', label: 'Profile', icon: User },
    ]

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${active
                                    ? 'text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`w-6 h-6 mb-1 ${active ? 'text-blue-600' : ''}`} />
                            <span className={`text-xs ${active ? 'font-semibold' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
