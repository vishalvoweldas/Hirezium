'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CandidateNavbar from '@/components/candidate/CandidateNavbar'
import CandidateMobileNav from '@/components/candidate/CandidateMobileNav'
import { useAuth } from '@/components/providers/AuthProvider'

export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login')
        } else if (!loading && user && user.role !== 'CANDIDATE') {
            if (user.role === 'RECRUITER') {
                router.push('/dashboard/recruiter')
            } else if (user.role === 'ADMIN') {
                router.push('/dashboard/admin')
            }
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#08262C]"></div>
            </div>
        )
    }

    if (!user || user.role !== 'CANDIDATE') {
        return null
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
