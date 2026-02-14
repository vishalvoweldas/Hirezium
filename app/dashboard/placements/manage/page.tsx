'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PlacementDataUpload from '@/components/PlacementDataUpload'
import { ArrowLeft, BarChart3 } from 'lucide-react'

export default function PlacementManagementPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [userRole, setUserRole] = useState<string | null>(null)

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
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                const data = await res.json()
                if (data.user.role === 'ADMIN' || data.user.role === 'RECRUITER') {
                    setUserRole(data.user.role)
                } else {
                    router.push('/candidate/home')
                }
            } else {
                router.push('/auth/login')
            }
        } catch (error) {
            router.push('/auth/login')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="gradient-primary text-white">
                <div className="container mx-auto px-4 py-4">
                    <Link href={userRole === 'ADMIN' ? '/dashboard/admin' : '/dashboard/recruiter'} className="flex items-center gap-0 text-lg md:text-2xl font-heading font-bold">
                        <img src="/icon-transparent.png" alt="Hirezium Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                        <span>Hirezium</span>
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href={userRole === 'ADMIN' ? '/dashboard/admin' : '/dashboard/recruiter'}>
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-primary-dark">
                                Placement Analytics Management
                            </h1>
                            <p className="text-secondary-dark">
                                Upload and manage placement data displayed on the home page
                            </p>
                        </div>
                    </div>
                </div>

                {/* Upload Component */}
                <div className="mb-8">
                    <PlacementDataUpload />
                </div>

                {/* Current Data Preview */}
                <Card className="card-modern">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold text-primary-dark mb-4">Current Placement Data</h3>
                        <p className="text-sm text-secondary-dark mb-4">
                            The data you upload will be displayed on the home page in the "Candidates Placed" section.
                            You can view the current data by visiting the{' '}
                            <Link href="/" className="text-blue-600 hover:underline">
                                home page
                            </Link>.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-600">
                                💡 <strong>Tip:</strong> Download the template to see the required format. Make sure your Excel file has columns: Year, Company Name, and Placed Count.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
