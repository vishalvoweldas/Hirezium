'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye } from 'lucide-react'

export default function ManageJobsPage() {
    const router = useRouter()
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/jobs', {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            setJobs(data.jobs || [])
        } catch (error) {
            console.error('Failed to fetch jobs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return

        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            setJobs(jobs.filter(j => j.id !== jobId))
        } catch (error) {
            alert('Failed to delete job')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="gradient-primary text-white">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard/recruiter" className="text-2xl font-heading font-bold">
                            HireFlow
                        </Link>
                        <div className="flex gap-3">
                            <Link href="/dashboard/recruiter">
                                <Button variant="secondary">Dashboard</Button>
                            </Link>
                            <Link href="/dashboard/recruiter/jobs/new">
                                <Button variant="secondary">Post New Job</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-heading font-bold mb-8">Manage Jobs</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : jobs.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500 mb-4">You haven't posted any jobs yet</p>
                            <Link href="/dashboard/recruiter/jobs/new">
                                <Button>Post Your First Job</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <Card key={job.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl">{job.title}</CardTitle>
                                            <p className="text-gray-600">{job.location}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Posted: {new Date(job.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant={job.isActive ? 'default' : 'secondary'}>
                                                {job.isActive ? 'Active' : 'Closed'}
                                            </Badge>
                                            <Badge variant="outline">{job.applicantCount || 0} Applicants</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/jobs/${job.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </Button>
                                        </Link>
                                        <Link href={`/dashboard/recruiter/jobs/edit/${job.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(job.id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
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
