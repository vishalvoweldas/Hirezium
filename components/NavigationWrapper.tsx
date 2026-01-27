'use client'

import { Navbar } from './Navbar'
import { MobileBottomNav } from './MobileBottomNav'
import { useEffect, useState } from 'react'

interface NavigationWrapperProps {
    children: React.ReactNode
}

export function NavigationWrapper({ children }: NavigationWrapperProps) {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#124A59] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <Navbar userRole={user?.role} userName={user?.profile?.fullName || user?.email} />
            <main className="min-h-screen pb-20 md:pb-0">
                {children}
            </main>
            <MobileBottomNav userRole={user?.role} />
        </>
    )
}
