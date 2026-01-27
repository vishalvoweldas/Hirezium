'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, Briefcase, Bookmark, FileText, User, Settings, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function CandidateNavbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [userName, setUserName] = useState<string>('Candidate')

    useEffect(() => {
        fetchUserName()
    }, [])

    const fetchUserName = async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                const profile = data.user.profile
                if (profile?.firstName && profile?.lastName) {
                    setUserName(`${profile.firstName} ${profile.lastName}`)
                } else if (data.user.email) {
                    setUserName(data.user.email.split('@')[0])
                }
            }
        } catch (error) {
            console.error('Failed to fetch user name:', error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/')
    }

    const navItems = [
        { href: '/candidate/home', label: 'Home', icon: Home },
        { href: '/candidate/jobs', label: 'Jobs', icon: Briefcase },
        { href: '/candidate/saved', label: 'Saved', icon: Bookmark },
        { href: '/candidate/applied', label: 'Applied', icon: FileText },
        { href: '/candidate/profile', label: 'Profile', icon: User },
        { href: '/candidate/settings', label: 'Settings', icon: Settings },
    ]

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

    return (
        <nav className="bg-[#08262C] text-white border-b border-white/10 sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-heading font-bold hover:opacity-90 transition-opacity">
                        HireFlow
                    </Link>

                    {/* Desktop-only Nav Items */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${active
                                        ? 'bg-white/20 text-white font-semibold'
                                        : 'text-on-gradient-muted hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Desktop User Info & Logout */}
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-sm text-on-gradient-muted">
                            Welcome, <span className="font-semibold text-white">{userName}</span>
                        </span>
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>

                    {/* Mobile Quick Actions */}
                    <div className="flex md:hidden items-center gap-2">
                        <Link href="/candidate/settings">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                <Settings className="w-5 h-5" />
                                <span className="sr-only">Settings</span>
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="sr-only">Logout</span>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
