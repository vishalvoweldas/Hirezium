'use client'

import { Navbar } from './Navbar'
import { MobileBottomNav } from './MobileBottomNav'
import { useAuth } from '@/components/providers/AuthProvider'
import { useEffect, useState } from 'react'

interface NavigationWrapperProps {
    children: React.ReactNode
}

export function NavigationWrapper({ children }: NavigationWrapperProps) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#124A59] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading Hirezium...</p>
                </div>
            </div>
        )
    }

    const userName = user?.candidateProfile
        ? `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}`
        : (user?.recruiterProfile?.companyName || user?.email)

    return (
        <>
            <Navbar userRole={user?.role} userName={userName} />
            <main className="min-h-screen pb-20 md:pb-0">
                {children}
            </main>
            <MobileBottomNav userRole={user?.role} />
        </>
    )
}
