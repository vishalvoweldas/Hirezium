'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, Briefcase, FileText, User, LogOut, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface NavbarProps {
    userRole?: 'CANDIDATE' | 'RECRUITER' | 'ADMIN' | null
    userName?: string
}

export function Navbar({ userRole, userName }: NavbarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/')
    }

    // Navigation items based on role
    const getNavItems = () => {
        if (!userRole) {
            return [
                { label: 'Find Jobs', href: '/jobs', icon: Briefcase },
                { label: 'Login', href: '/auth/login', icon: User },
            ]
        }

        if (userRole === 'CANDIDATE') {
            return [
                { label: 'Browse Jobs', href: '/jobs', icon: Briefcase },
                { label: 'My Applications', href: '/dashboard/candidate/applied', icon: FileText },
                { label: 'Profile', href: '/dashboard/candidate/profile', icon: User },
            ]
        }

        if (userRole === 'RECRUITER') {
            return [
                { label: 'Dashboard', href: '/dashboard/recruiter', icon: Home },
                { label: 'My Jobs', href: '/dashboard/recruiter/jobs', icon: Briefcase },
                { label: 'Applicants', href: '/dashboard/recruiter/applicants', icon: FileText },
            ]
        }

        if (userRole === 'ADMIN') {
            return [
                { label: 'Dashboard', href: '/dashboard/admin', icon: Home },
                { label: 'Jobs', href: '/dashboard/admin/jobs', icon: Briefcase },
                { label: 'Recruiters', href: '/dashboard/admin/recruiters', icon: User },
            ]
        }

        return []
    }

    const navItems = getNavItems()

    return (
        <nav className="gradient-primary text-white sticky top-0 z-50 shadow-lg">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-heading font-bold hover:opacity-90 transition-opacity">
                        HireFlow
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${pathname === item.href
                                        ? 'bg-white/20 font-semibold'
                                        : 'hover:bg-white/10'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        ))}

                        {userRole && userName && (
                            <>
                                <span className="text-sm border-l border-white/20 pl-6">
                                    Welcome, {userName}
                                </span>
                                <Button
                                    variant="ghost"
                                    className="text-white hover:bg-white/10"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </>
                        )}

                        {!userRole && (
                            <Link href="/auth/signup">
                                <Button className="bg-white text-primary-dark hover:bg-white/90">
                                    Sign Up
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
                        <div className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${pathname === item.href
                                            ? 'bg-white/20 font-semibold'
                                            : 'hover:bg-white/10'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            ))}

                            {userRole && (
                                <button
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all text-left"
                                    onClick={() => {
                                        handleLogout()
                                        setMobileMenuOpen(false)
                                    }}
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            )}

                            {!userRole && (
                                <Link
                                    href="/auth/signup"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-primary-dark rounded-lg font-semibold hover:bg-white/90 transition-all mt-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
