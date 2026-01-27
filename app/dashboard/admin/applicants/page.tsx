'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStatusColor } from '@/lib/utils'

export default function AdminApplicantsPage() {
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchApplications()
    }, [])

    const fetchApplications = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/applications', {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            setApplications(data.applications || [])
        } catch (error) {
            console.error('Failed to fetch applications:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="gradient-primary text-white">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/dashboard/admin" className="text-2xl font-heading font-bold">
                        HireFlow Admin
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-heading font-bold mb-8">All Applicants</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : applications.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500">No applications yet</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <Card key={app.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">
                                                {[app.candidate.candidateProfile?.firstName, app.candidate.candidateProfile?.lastName]
                                                    .filter(Boolean)
                                                    .join(' ') || 'Candidate'}
                                            </CardTitle>
                                            <p className="text-sm text-gray-600">{app.candidate.email}</p>
                                            <p className="text-sm text-gray-600 mt-1">Applied for: {app.job.title}</p>
                                            <p className="text-sm text-gray-500">Company: {app.job.companyName || 'N/A'}</p>
                                        </div>
                                        <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
