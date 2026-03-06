'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, X, Bookmark } from 'lucide-react'

export default function SavedJobsPage() {
    const [savedJobs, setSavedJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSavedJobs()
    }, [])

    const fetchSavedJobs = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/saved-jobs', {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            setSavedJobs(data.savedJobs || [])
        } catch (error) {
            console.error('Failed to fetch saved jobs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUnsave = async (jobId: string) => {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/saved-jobs?jobId=${jobId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            setSavedJobs(savedJobs.filter(item => item.job.id !== jobId))
        } catch (error) {
            console.error('Failed to unsave job:', error)
        }
    }

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4">
                <div className="content-container">
                    <h1 className="text-3xl font-heading font-bold mb-8 text-primary-dark">Saved Jobs</h1>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : savedJobs.length === 0 ? (
                        <Card className="card-modern">
                            <CardContent className="py-12 text-center">
                                <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-secondary-dark mb-4">You haven't saved any jobs yet</p>
                                <Link href="/candidate/jobs">
                                    <Button className="btn-primary">Browse Jobs</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedJobs.map((item) => (
                                <Card key={item.id} className="card-modern card-hover relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={() => handleUnsave(item.job.id)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                    <CardHeader>
                                        <CardTitle className="text-xl text-primary-dark">{item.job.title}</CardTitle>
                                        <p className="text-secondary-dark">{item.job.companyName || 'Company'}</p>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center text-sm text-secondary-dark">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            {item.job.location}
                                        </div>
                                        <div className="flex items-center text-sm text-secondary-dark">
                                            <Briefcase className="w-4 h-4 mr-2" />
                                            {item.job.jobType.replace('_', ' ')}
                                        </div>
                                        <Link href={`/jobs/${item.job.id}`}>
                                            <Button className="w-full mt-4 btn-primary">View Details</Button>
                                        </Link>
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
