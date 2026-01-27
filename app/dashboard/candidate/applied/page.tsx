'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime, getStatusColor } from '@/lib/utils'

export default function AppliedJobsPage() {
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
                    <Link href="/dashboard/candidate" className="text-2xl font-heading font-bold">
                        HireFlow
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-heading font-bold mb-8">My Applications</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : applications.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
                            <Link href="/jobs">
                                <Button>Browse Jobs</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <Card key={app.id} className="card-hover">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl">{app.job.title}</CardTitle>
                                            <p className="text-gray-600">{app.job.companyName || 'Company'}</p>
                                        </div>
                                        <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>Applied {formatRelativeTime(app.appliedAt)}</span>
                                        <Link href={`/jobs/${app.job.id}`}>
                                            <Button variant="outline" size="sm">View Job</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
