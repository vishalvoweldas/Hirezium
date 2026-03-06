'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import useSWR from 'swr'
import { useRouter, usePathname } from 'next/navigation'
import { fetcher } from '@/lib/utils'

interface AuthContextType {
    user: any
    loading: boolean
    error: any
    mutate: any
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    error: null,
    mutate: () => { },
    logout: () => { },
    isAuthenticated: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()

    // Only fetch if we have a token or we are on a protected route
    // For simplicity, we'll fetch always if token exists
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token')

    const { data, error, isValidating, mutate } = useSWR(
        hasToken ? '/api/auth/me' : null,
        fetcher,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            dedupingInterval: 10000, // 10 seconds
        }
    )

    const [isInitialLoading, setIsInitialLoading] = useState(hasToken)

    const user = data?.user || null
    const loading = isValidating && !data
    const isAuthenticated = !!user

    useEffect(() => {
        if (!isValidating) {
            setIsInitialLoading(false)
        }
    }, [isValidating])

    // Effect to handle transitions when token is removed manually or expires
    useEffect(() => {
        if (hasToken && error?.status === 401) {
            logout()
        }
    }, [error, hasToken])

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        mutate(null, false)
        if (pathname.includes('/dashboard') || pathname.includes('/candidate')) {
            router.push('/auth/login')
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading: isInitialLoading || loading,
                error,
                mutate,
                logout,
                isAuthenticated
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
