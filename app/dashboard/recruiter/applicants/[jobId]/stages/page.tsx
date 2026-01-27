'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StageUpload from '@/components/StageUpload'
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react'
import ResumePreviewModal from '@/components/ResumePreviewModal'

interface Application {
    id: string
    currentStage: number
    status: string
    candidate: {
        email: string
        candidateProfile: {
            firstName: string
            lastName: string
        }
    }
    appliedAt: string
    resumeUrl: string | null
}

interface StageBreakdown {
    jobId: string
    totalStages: number
    stageBreakdown: Record<number, number>
    rejectedCount: number
    selectedCount: number
    totalApplications: number
}

export default function JobStagesPage() {
    const params = useParams()
    const [job, setJob] = useState<any>(null)
    const [stageData, setStageData] = useState<StageBreakdown | null>(null)
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedStage, setSelectedStage] = useState(1)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        fetchJobAndStages()
        fetchApplications()
    }, [])

    const fetchJobAndStages = async () => {
        try {
            const token = localStorage.getItem('token')

            // Fetch job details
            const jobRes = await fetch(`/api/jobs/${params.jobId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const jobData = await jobRes.json()
            setJob(jobData)

            // Fetch stage breakdown
            const stagesRes = await fetch(`/api/jobs/${params.jobId}/stages`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const stagesData = await stagesRes.json()
            setStageData(stagesData)
        } catch (error) {
            console.error('Failed to fetch job and stages:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/applications?jobId=${params.jobId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            setApplications(data.applications || [])
        } catch (error) {
            console.error('Failed to fetch applications:', error)
        }
    }

    const handleUploadComplete = () => {
        // Refresh data after upload
        fetchJobAndStages()
        fetchApplications()
    }

    const getFilteredApplications = () => {
        return applications.filter(app => {
            if (selectedStage === 0) return app.status === 'REJECTED'
            if (selectedStage === -1) return app.status === 'SELECTED'
            return app.currentStage === selectedStage && app.status !== 'REJECTED' && app.status !== 'SELECTED'
        })
    }

    if (loading) {
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
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

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
                <div className="mb-6">
                    <Link href="/dashboard/recruiter/applicants">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Applicants
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-heading font-bold mb-2">{job?.title}</h1>
                    <p className="text-gray-600">Manage Interview Stages</p>
                </div>

                {/* Stage Overview */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Stages</p>
                                    <p className="text-3xl font-bold text-blue-600">{stageData?.totalStages || 0}</p>
                                </div>
                                <Clock className="w-12 h-12 text-blue-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Applications</p>
                                    <p className="text-3xl font-bold text-purple-600">{stageData?.totalApplications || 0}</p>
                                </div>
                                <Users className="w-12 h-12 text-purple-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Selected</p>
                                    <p className="text-3xl font-bold text-green-600">{stageData?.selectedCount || 0}</p>
                                </div>
                                <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Rejected</p>
                                    <p className="text-3xl font-bold text-red-600">{stageData?.rejectedCount || 0}</p>
                                </div>
                                <XCircle className="w-12 h-12 text-red-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stage Breakdown */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Candidates by Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: stageData?.totalStages || 0 }, (_, i) => i + 1).map(stage => (
                                <Button
                                    key={stage}
                                    variant={selectedStage === stage ? 'default' : 'outline'}
                                    onClick={() => setSelectedStage(stage)}
                                    className="flex items-center gap-2"
                                >
                                    Stage {stage}
                                    <Badge variant="secondary" className="ml-1">
                                        {stageData?.stageBreakdown[stage] || 0}
                                    </Badge>
                                </Button>
                            ))}
                            <Button
                                variant={selectedStage === -1 ? 'default' : 'outline'}
                                onClick={() => setSelectedStage(-1)}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                            >
                                Selected
                                <Badge variant="secondary" className="ml-1">
                                    {stageData?.selectedCount || 0}
                                </Badge>
                            </Button>
                            <Button
                                variant={selectedStage === 0 ? 'default' : 'outline'}
                                onClick={() => setSelectedStage(0)}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                            >
                                Rejected
                                <Badge variant="secondary" className="ml-1">
                                    {stageData?.rejectedCount || 0}
                                </Badge>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Upload Component - Only show for active stages */}
                {selectedStage > 0 && selectedStage <= (stageData?.totalStages || 0) && (
                    <div className="mb-8">
                        <StageUpload
                            jobId={params.jobId as string}
                            currentStage={selectedStage}
                            totalStages={stageData?.totalStages || 1}
                            onUploadComplete={handleUploadComplete}
                        />
                    </div>
                )}

                {/* Candidates List */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {selectedStage === 0 ? 'Rejected Candidates' :
                                selectedStage === -1 ? 'Selected Candidates' :
                                    `Candidates at Stage ${selectedStage}`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {getFilteredApplications().length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No candidates at this stage</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4">Name</th>
                                            <th className="text-left py-3 px-4">Email</th>
                                            <th className="text-left py-3 px-4">Status</th>
                                            <th className="text-left py-3 px-4">Applied Date</th>
                                            <th className="text-left py-3 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getFilteredApplications().map(app => (
                                            <tr key={app.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    {[app.candidate.candidateProfile?.firstName, app.candidate.candidateProfile?.lastName]
                                                        .filter(Boolean)
                                                        .join(' ') || 'N/A'}
                                                </td>
                                                <td className="py-3 px-4">{app.candidate.email}</td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        variant={
                                                            app.status === 'SELECTED' ? 'default' :
                                                                app.status === 'REJECTED' ? 'destructive' :
                                                                    'secondary'
                                                        }
                                                    >
                                                        {app.status.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {new Date(app.appliedAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {app.resumeUrl && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setPreviewUrl(app.resumeUrl)}
                                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 p-0"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Preview
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ResumePreviewModal
                url={previewUrl}
                onClose={() => setPreviewUrl(null)}
            />
        </div>
    )
}
