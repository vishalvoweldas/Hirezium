'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime, getStatusColor } from '@/lib/utils'
import { FileText } from 'lucide-react'

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
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4">
                <div className="content-container">
                    <h1 className="text-3xl font-heading font-bold mb-8 text-primary-dark">My Applications</h1>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : applications.length === 0 ? (
                        <Card className="card-modern">
                            <CardContent className="py-12 text-center">
                                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-secondary-dark mb-4">You haven't applied to any jobs yet</p>
                                <Link href="/candidate/jobs">
                                    <Button className="btn-primary">Browse Jobs</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {applications.map((app) => (
                                <Card key={app.id} className="card-modern card-hover">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl text-primary-dark">{app.job.title}</CardTitle>
                                                <p className="text-secondary-dark">{app.job.companyName || 'Company'}</p>
                                            </div>
                                            <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm text-secondary-dark">
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
        </div>
    )
}
