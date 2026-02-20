'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MapPin, Briefcase, Clock } from 'lucide-react'
import EnhancedApplicationModal from '@/components/EnhancedApplicationModal'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function JobDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [job, setJob] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [showApplyModal, setShowApplyModal] = useState(false)
    const [coverLetter, setCoverLetter] = useState('')
    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)
    const [existingApplication, setExistingApplication] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [useExistingResume, setUseExistingResume] = useState(true)

    useEffect(() => {
        checkAuth()
        fetchJob()
    }, [])

    useEffect(() => {
        if (isAuthenticated && userRole === 'CANDIDATE' && job) {
            checkExistingApplication()
            fetchProfile()
        }
    }, [isAuthenticated, userRole, job])

    const checkAuth = () => {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr)
                setIsAuthenticated(true)
                setUserRole(user.role)
            } catch (error) {
                setIsAuthenticated(false)
                setUserRole(null)
            }
        } else {
            setIsAuthenticated(false)
            setUserRole(null)
        }
    }

    const fetchJob = async () => {
        try {
            const res = await fetch(`/api/jobs/${params.id}`)
            const data = await res.json()
            setJob(data)
        } catch (error) {
            console.error('Failed to fetch job:', error)
        } finally {
            setLoading(false)
        }
    }

    const checkExistingApplication = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/applications?jobId=${params.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()

            // Check if user has already applied to this job
            if (data.applications && data.applications.length > 0) {
                setExistingApplication(data.applications[0])
            }
        } catch (error) {
            console.error('Failed to check application:', error)
        }
    }

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.user.profile) {
                setProfile(data.user.profile)
                // If profile has resume, default to using it
                if (data.user.profile.resumeUrl) {
                    setUseExistingResume(true)
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error)
        }
    }

    const handleApplyClick = () => {
        if (!isAuthenticated) {
            // Redirect to login with return URL
            router.push(`/auth/login?redirect=/jobs/${params.id}`)
        } else if (userRole?.toUpperCase() === 'CANDIDATE') {
            setShowApplyModal(true)
        } else {
            alert('Only candidates can apply for jobs')
        }
    }

    const handleSubmitApplication = async (data: { coverLetter: string; resumeUrl: string }) => {
        setApplying(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    jobId: params.id,
                    coverLetter: data.coverLetter,
                    resumeUrl: data.resumeUrl,
                }),
            })

            if (res.ok) {
                setApplied(true)
                // Refresh profile since it was updated in the modal
                fetchProfile()
                setTimeout(() => {
                    setShowApplyModal(false)
                    router.push('/dashboard/candidate/applied')
                }, 2000)
            } else {
                const responseData = await res.json()
                throw new Error(responseData.error || 'Failed to submit application')
            }
        } catch (error: any) {
            alert(error.message || 'Failed to submit application')
            throw error // Re-throw to inform the modal
        } finally {
            setApplying(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <nav className="gradient-primary text-white">
                    <div className="container mx-auto px-4 py-4">
                        <Link href="/" className="flex items-center gap-0 text-lg md:text-2xl font-heading font-bold">
                            <img src="/icon-transparent.png" alt="Hirezium Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                            <span>Hirezium</span>
                        </Link>
                    </div>
                </nav>
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gray-50">
                <nav className="gradient-primary text-white">
                    <div className="container mx-auto px-4 py-4">
                        <Link href="/" className="flex items-center gap-0 text-lg md:text-2xl font-heading font-bold">
                            <img src="/icon-transparent.png" alt="Hirezium Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                            <span>Hirezium</span>
                        </Link>
                    </div>
                </nav>
                <div className="container mx-auto px-4 py-8">
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500">Job not found</p>
                            <Link href="/jobs">
                                <Button className="mt-4">Back to Jobs</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="gradient-primary text-white">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-0 text-lg md:text-2xl font-heading font-bold">
                            <img src="/icon-transparent.png" alt="Hirezium Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                            <span>Hirezium</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="/jobs">
                                <Button variant="ghost" className="text-white hover:bg-white/10">
                                    Back to Jobs
                                </Button>
                            </Link>
                            {isAuthenticated ? (
                                <Link href={`/dashboard/${userRole?.toLowerCase()}`}>
                                    <Button variant="secondary">Dashboard</Button>
                                </Link>
                            ) : (
                                <Link href="/auth/login">
                                    <Button variant="secondary">Login</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>

                                </div>
                                <div className="flex gap-2">
                                    {job.workMode === 'REMOTE' && (
                                        <Badge className="bg-green-100 text-green-800">Remote</Badge>
                                    )}
                                    {job.workMode === 'ON_SITE' && (
                                        <Badge className="bg-blue-100 text-blue-800">On-site</Badge>
                                    )}
                                    {job.workMode === 'HYBRID' && (
                                        <Badge className="bg-purple-100 text-purple-800">Hybrid</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    <div className="flex flex-wrap gap-2">
                                        {job.location.split(',').map((loc: string, index: number) => (
                                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                {loc.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Briefcase className="w-5 h-5 mr-2" />
                                    {job.jobType.replace('_', ' ')}
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Clock className="w-5 h-5 mr-2" />
                                    {job.experience}
                                </div>
                                {job.salary && (
                                    <div className="flex items-center text-gray-600">
                                        <span className="font-semibold text-gray-500 mr-2">CTC</span>
                                        {job.salary}
                                    </div>
                                )}
                            </div>

                            {/* Show stages information if available */}
                            {job.stages && job.stages > 1 && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-sm text-blue-800">
                                        <strong>Interview Process:</strong> This position has {job.stages} interview rounds
                                    </p>
                                </div>
                            )}
                        </CardHeader>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Job Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none text-gray-700 prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-5 prose-ol:pl-5">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {job.description}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Required Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-sm">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sticky Apply Button */}
                    <div className="sticky bottom-0 bg-white border-t p-4 shadow-lg">
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleApplyClick}
                        >
                            Apply Now
                        </Button>
                        {!isAuthenticated && (
                            <p className="text-center text-sm text-gray-500 mt-2">
                                You need to login to apply for this job
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Application Modal */}
            <EnhancedApplicationModal
                open={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                profile={profile}
                jobId={params.id as string}
                onSubmit={handleSubmitApplication}
            />
        </div>
    )
}
