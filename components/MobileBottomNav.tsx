'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Briefcase, FileText, User, LayoutDashboard } from 'lucide-react'

interface MobileBottomNavProps {
    userRole?: 'CANDIDATE' | 'RECRUITER' | 'ADMIN' | null
}

export function MobileBottomNav({ userRole }: MobileBottomNavProps) {
    const pathname = usePathname()

    // Navigation items based on role
    const getNavItems = () => {
        if (!userRole) {
            return [
                { label: 'Home', href: '/', icon: Home },
                { label: 'Jobs', href: '/jobs', icon: Briefcase },
                { label: 'Login', href: '/auth/login', icon: User },
            ]
        }

        if (userRole === 'CANDIDATE') {
            return [
                { label: 'Home', href: '/dashboard/candidate', icon: Home },
                { label: 'Jobs', href: '/jobs', icon: Briefcase },
                { label: 'Applied', href: '/dashboard/candidate/applied', icon: FileText },
                { label: 'Profile', href: '/dashboard/candidate/profile', icon: User },
            ]
        }

        if (userRole === 'RECRUITER') {
            return [
                { label: 'Dashboard', href: '/dashboard/recruiter', icon: LayoutDashboard },
                { label: 'Jobs', href: '/dashboard/recruiter/jobs', icon: Briefcase },
                { label: 'Applicants', href: '/dashboard/recruiter/applicants', icon: FileText },
                { label: 'Profile', href: '/dashboard/recruiter/profile', icon: User },
            ]
        }

        if (userRole === 'ADMIN') {
            return [
                { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
                { label: 'Jobs', href: '/dashboard/admin/jobs', icon: Briefcase },
                { label: 'Recruiters', href: '/dashboard/admin/recruiters', icon: User },
            ]
        }

        return []
    }

    const navItems = getNavItems()

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
            <div className="grid grid-cols-4 gap-1 px-2 py-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${isActive
                                    ? 'bg-gradient-to-br from-[#124A59] to-[#08262C] text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                            <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
