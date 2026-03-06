'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, X, Bookmark, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
        <div className="min-h-screen bg-gray-50 py-8">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedJobs.map((item) => (
                                <Card key={item.id} className="card-modern flex flex-col h-full hover:shadow-lg transition-shadow duration-300 relative group">
                                    <button
                                        onClick={() => handleUnsave(item.job.id)}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all z-10 shadow-sm opacity-0 group-hover:opacity-100"
                                        title="Remove from saved"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <CardTitle className="text-xl font-heading font-bold text-primary-dark line-clamp-2 min-h-[3.5rem]">
                                                {item.job.title}
                                            </CardTitle>
                                            <Badge variant="outline" className="rounded-full bg-gray-50 text-gray-600 border-gray-200 text-[10px] uppercase font-bold whitespace-nowrap px-3 py-1">
                                                {item.job.workMode?.replace('_', '-').toLowerCase() || 'on-site'}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 space-y-4">
                                        <div className="space-y-2 text-sm text-secondary-dark">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="line-clamp-1">{item.job.location}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                                    <span>{item.job.jobType?.replace('_', ' ')}</span>
                                                </div>
                                                {item.job.salary && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold">CTC</span>
                                                        <span className="text-sm font-bold text-green-600">{item.job.salary}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span>{item.job.experience || "Freshers Only"}</span>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        {item.job.skills && item.job.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 min-h-[3rem]">
                                                {item.job.skills.slice(0, 3).map((skill: string, i: number) => (
                                                    <Badge key={i} variant="secondary" className="bg-gray-50 text-gray-600 border-gray-200 text-[10px] font-medium px-2 py-0.5">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {item.job.skills.length > 3 && (
                                                    <Badge variant="secondary" className="bg-gray-50 text-gray-600 border-gray-200 text-[10px] font-medium px-2 py-0.5">
                                                        +{item.job.skills.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        <div className="pt-4 mt-auto">
                                            <Link href={`/jobs/${item.job.id}`} className="block">
                                                <Button className="w-full bg-[#08262C] hover:bg-[#124A59] text-white font-bold py-6 rounded-lg transition-all duration-300">
                                                    View Details
                                                </Button>
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
