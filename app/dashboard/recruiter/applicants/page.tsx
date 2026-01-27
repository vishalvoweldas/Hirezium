'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { getStatusColor } from '@/lib/utils'
import ResumePreviewModal from '@/components/ResumePreviewModal'
import { Download, X } from 'lucide-react'

export default function ApplicantsPage() {
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedJob, setSelectedJob] = useState<string>('all')
    const [jobs, setJobs] = useState<any[]>([])
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        fetchJobs()
        fetchApplications()
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
        }
    }

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

    const updateStatus = async (appId: string, status: string) => {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/applications/${appId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            })
            fetchApplications()
        } catch (error) {
            alert('Failed to update status')
        }
    }

    const handleExport = async (jobId: string, format: string) => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/export/applicants/${jobId}?format=${format}&includeFull=true`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `applicants.${format === 'pdf' ? 'pdf' : 'xlsx'}`
            a.click()
        } catch (error) {
            alert('Failed to export data')
        }
    }

    const filteredApplications = selectedJob === 'all'
        ? applications
        : applications.filter(app => app.jobId === selectedJob)

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="gradient-primary text-white">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/dashboard/recruiter" className="text-2xl font-heading font-bold">
                        HireFlow
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-heading font-bold">Applicants</h1>
                    {selectedJob !== 'all' && (
                        <div className="flex gap-2">
                            <Link href={`/dashboard/recruiter/applicants/${selectedJob}/stages`}>
                                <Button className="gradient-primary text-white">
                                    Manage Stages
                                </Button>
                            </Link>
                            <Button variant="outline" onClick={() => handleExport(selectedJob, 'excel')}>
                                <Download className="w-4 h-4 mr-2" />
                                Export Excel
                            </Button>
                            <Button variant="outline" onClick={() => handleExport(selectedJob, 'pdf')}>
                                <Download className="w-4 h-4 mr-2" />
                                Export PDF
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <Label className="mb-2 block">Filter by Job</Label>
                    <Select value={selectedJob} onValueChange={setSelectedJob}>
                        <SelectTrigger className="w-64">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Jobs</SelectItem>
                            {jobs.map(job => (
                                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : filteredApplications.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500">No applications yet</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredApplications.map((app) => (
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
                                        </div>
                                        <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <Select value={app.status} onValueChange={(value) => updateStatus(app.id, value)}>
                                            <SelectTrigger className="w-48">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NEW">New</SelectItem>
                                                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                                                <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {app.resumeUrl && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPreviewUrl(app.resumeUrl)}
                                            >
                                                View Resume
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <ResumePreviewModal
                url={previewUrl}
                onClose={() => setPreviewUrl(null)}
            />
        </div>
    )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <label className={className}>{children}</label>
}
