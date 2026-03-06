'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Upload, X, FileText, Eye, Download } from 'lucide-react'
import ResumePreviewModal from '@/components/ResumePreviewModal'

export default function CandidateProfile() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        location: '',
        experience: 0 as string | number,
        skills: [] as string[],
        bio: '',
        resumeUrl: '',
        resumePublicId: '',
        currentCompany: '',
        currentRole: '',
        noticePeriod: '',
        currentCtc: '',
        expectedCtc: '',
    })
    const [newSkill, setNewSkill] = useState('')
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.user.profile) {
                setFormData({
                    firstName: data.user.profile.firstName || '',
                    lastName: data.user.profile.lastName || '',
                    phone: data.user.profile.phone || '',
                    location: data.user.profile.location || '',
                    experience: data.user.profile.experience || 0,
                    skills: data.user.profile.skills || [],
                    bio: data.user.profile.bio || '',
                    resumeUrl: data.user.profile.resumeUrl || '',
                    resumePublicId: data.user.profile.resumePublicId || '',
                    currentCompany: data.user.profile.currentCompany || '',
                    currentRole: data.user.profile.currentRole || '',
                    noticePeriod: data.user.profile.noticePeriod || '',
                    currentCtc: data.user.profile.currentCtc || '',
                    expectedCtc: data.user.profile.expectedCtc || '',
                })
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error)
        }
    }

    const handleAddSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] })
            setNewSkill('')
        }
    }

    const handleRemoveSkill = (skill: string) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) })
    }

    const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            if (!validTypes.includes(file.type)) {
                alert('Please upload a PDF or DOCX file')
                return
            }
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB')
                return
            }
            setResumeFile(file)
        }
    }

    const uploadResume = async () => {
        if (!resumeFile) return { url: formData.resumeUrl, publicId: formData.resumePublicId }

        setUploading(true)
        try {
            const uploadFormData = new FormData()
            uploadFormData.append('file', resumeFile)

            const token = localStorage.getItem('token')
            const res = await fetch('/api/upload/resume', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: uploadFormData,
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload failed')

            return { url: data.url, publicId: data.publicId }
        } catch (error: any) {
            console.error('Resume upload failed:', error)
            alert(error.message || 'Failed to upload resume')
            return { url: formData.resumeUrl, publicId: formData.resumePublicId }
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Mandatory fields check
        const isMissingFields = !formData.firstName ||
            !formData.lastName ||
            !formData.phone ||
            formData.experience === undefined ||
            formData.experience === null ||
            !formData.skills || formData.skills.length === 0 ||
            (!formData.resumeUrl && !resumeFile)

        // Conditional mandatory fields check
        const isExperienced = Number(formData.experience) > 0
        if (isExperienced) {
            if (!formData.currentCompany || !formData.currentRole || !formData.noticePeriod || !formData.currentCtc || !formData.expectedCtc) {
                alert('All company details are mandatory for experienced candidates')
                return
            }
        }

        if (isMissingFields) {
            alert('all the red* fields should be provide')
            return
        }

        setLoading(true)
        try {
            // Upload resume if new file selected
            let resumeUrl = formData.resumeUrl
            let resumePublicId = formData.resumePublicId

            if (resumeFile) {
                const result = await uploadResume()
                resumeUrl = result.url
                resumePublicId = result.publicId
            }

            const token = localStorage.getItem('token')
            const res = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    experience: parseFloat(formData.experience.toString()),
                    resumeUrl,
                    resumePublicId,
                }),
            })

            const data = await res.json()

            if (res.ok) {
                alert('Profile updated successfully!')
                router.push('/dashboard/candidate')
            } else {
                alert(data.error || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Update profile error:', error)
            alert('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="gradient-primary text-white">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/dashboard/candidate" className="text-2xl font-heading font-bold">
                        Hirezium
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <h1 className="text-3xl font-heading font-bold mb-8">Update Profile</h1>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resume">Resume (PDF or DOCX) <span className="text-red-500">*</span></Label>
                                {formData.resumeUrl && !resumeFile && (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md mb-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm text-gray-700 flex-1">Current Resume</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPreviewUrl(formData.resumeUrl)}
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Preview
                                        </Button>
                                    </div>
                                )}
                                {resumeFile && (
                                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md mb-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm text-gray-700 flex-1">{resumeFile.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setResumeFile(null)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleResumeChange}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {formData.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Accepted formats: PDF, DOC, DOCX (Max 5MB)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1234567891"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experience">Years of Experience <span className="text-red-500">*</span></Label>
                                {/* Use text input to allow decimals without browser interference */}
                                <Input
                                    id="experience"
                                    type="text"
                                    autoComplete="off"
                                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={formData.experience}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Allow only numbers and a single decimal point
                                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                            setFormData({ ...formData, experience: value });
                                        }
                                    }}
                                    placeholder="0"
                                />
                            </div>

                            {Number(formData.experience) > 0 && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentCompany">Current Company <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="currentCompany"
                                                value={formData.currentCompany}
                                                onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                                                placeholder="Company Name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="currentRole">Current Role <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="currentRole"
                                                value={formData.currentRole}
                                                onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                                                placeholder="Software Engineer"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="noticePeriod">Notice Period <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="noticePeriod"
                                                value={formData.noticePeriod}
                                                onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                                                placeholder="e.g. 30 days"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentCtc">Current CTC <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="currentCtc"
                                                value={formData.currentCtc}
                                                onChange={(e) => setFormData({ ...formData, currentCtc: e.target.value })}
                                                placeholder="e.g. 10 LPA"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="expectedCtc">Expected CTC <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="expectedCtc"
                                                value={formData.expectedCtc}
                                                onChange={(e) => setFormData({ ...formData, expectedCtc: e.target.value })}
                                                placeholder="e.g. 15 LPA"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label>Skills <span className="text-red-500">*</span></Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.skills.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="hover:text-red-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a skill"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                    />
                                    <Button type="button" onClick={handleAddSkill}>Add</Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>



                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    rows={4}
                                    placeholder="Tell us about yourself..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={loading || uploading}>
                                    {uploading ? 'Uploading Resume...' : loading ? 'Saving...' : 'Save Profile'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <ResumePreviewModal
                open={!!previewUrl}
                publicId={formData.resumePublicId || ''}
                url={previewUrl || ''}
                onClose={() => setPreviewUrl(null)}
            />
        </div>
    )
}
