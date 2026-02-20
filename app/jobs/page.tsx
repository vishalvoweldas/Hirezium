'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { NavigationWrapper } from '@/components/NavigationWrapper'
import { MapPin, Briefcase, Clock } from 'lucide-react'

export default function JobsPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        try {
            const res = await fetch('/api/jobs')
            const data = await res.json()
            setJobs(data.jobs || [])
        } catch (error) {
            console.error('Failed to fetch jobs:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <NavigationWrapper>
            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="content-container">
                    <div className="mb-8">
                        <h1 className="text-4xl font-heading font-bold mb-2 text-primary-dark">Find Your Next Opportunity</h1>
                        <p className="text-secondary-dark">Browse through {jobs.length} available positions</p>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-20 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : jobs.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-dark">No jobs available at the moment. Check back later!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <Card key={job.id} className="card-hover">
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <CardTitle className="text-xl text-primary-dark">{job.title}</CardTitle>
                                            {job.workMode === 'REMOTE' && (
                                                <Badge variant="secondary">Remote</Badge>
                                            )}
                                            {job.workMode === 'ON_SITE' && (
                                                <Badge variant="outline">On-site</Badge>
                                            )}
                                            {job.workMode === 'HYBRID' && (
                                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-none">Hybrid</Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center text-sm text-secondary-dark">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-secondary-dark">
                                            <div className="flex items-center">
                                                <Briefcase className="w-4 h-4 mr-2" />
                                                {job.jobType.replace('_', ' ')}
                                            </div>
                                            {job.salary && (
                                                <div className="flex items-center font-bold text-green-600 pr-4">
                                                    <span className="text-gray-500 mr-2 text-xs font-normal uppercase">CTC</span>
                                                    <span className="text-base">{job.salary}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center text-sm text-secondary-dark">
                                            <Clock className="w-4 h-4 mr-2" />
                                            {job.experience}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {job.skills.slice(0, 3).map((skill: string, index: number) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {job.skills.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{job.skills.length - 3} more
                                                </Badge>
                                            )}
                                        </div>

                                        <Link href={`/jobs/${job.id}`}>
                                            <Button className="w-full mt-4 btn-primary">View Details</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </NavigationWrapper>
    )
}
