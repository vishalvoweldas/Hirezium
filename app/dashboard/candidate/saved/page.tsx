'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, X } from 'lucide-react'

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
        <div className="min-h-screen bg-gray-50">
            <nav className="gradient-primary text-white">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/dashboard/candidate" className="flex items-center gap-0 text-lg md:text-2xl font-heading font-bold">
                        <img src="/icon-transparent.png" alt="Hirezium Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                        <span>Hirezium</span>
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-heading font-bold mb-8">Saved Jobs</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : savedJobs.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500 mb-4">You haven't saved any jobs yet</p>
                            <Link href="/jobs">
                                <Button>Browse Jobs</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedJobs.map((item) => (
                            <Card key={item.id} className="card-hover relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={() => handleUnsave(item.job.id)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                                <CardHeader>
                                    <CardTitle className="text-xl">{item.job.title}</CardTitle>
                                    <p className="text-gray-600">{item.job.companyName || 'Company'}</p>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {item.job.location}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Briefcase className="w-4 h-4 mr-2" />
                                        {item.job.jobType.replace('_', ' ')}
                                    </div>
                                    <Link href={`/jobs/${item.job.id}`}>
                                        <Button className="w-full mt-4">View Details</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
