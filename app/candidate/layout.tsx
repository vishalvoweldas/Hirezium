'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CandidateNavbar from '@/components/candidate/CandidateNavbar'
import CandidateMobileNav from '@/components/candidate/CandidateMobileNav'

export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/auth/login')
            return
        }

        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!res.ok) {
                router.push('/auth/login')
                return
            }

            const data = await res.json()

            // Check if user is a candidate
            if (data.user.role !== 'CANDIDATE') {
                // Redirect to appropriate dashboard
                if (data.user.role === 'RECRUITER') {
                    router.push('/dashboard/recruiter')
                } else if (data.user.role === 'ADMIN') {
                    router.push('/dashboard/admin')
                }
            }
        } catch (error) {
            router.push('/auth/login')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Navbar */}
            <CandidateNavbar />

            {/* Main Content */}
            <main className="pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <CandidateMobileNav />
        </div>
    )
}
