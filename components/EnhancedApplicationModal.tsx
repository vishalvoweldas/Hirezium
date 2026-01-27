'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Upload, FileText, X, CheckCircle, User, MapPin, Briefcase } from 'lucide-react'

interface EnhancedApplicationModalProps {
    open: boolean
    onClose: () => void
    profile: any
    jobId: string
    onSubmit: (data: { coverLetter: string; resumeUrl: string }) => Promise<void>
}

export default function EnhancedApplicationModal({
    open,
    onClose,
    profile,
    jobId,
    onSubmit,
}: EnhancedApplicationModalProps) {
    const [coverLetter, setCoverLetter] = useState('')
    const [resumeOption, setResumeOption] = useState<'existing' | 'new'>('existing')
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

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
        if (!resumeFile) return null

        setUploading(true)
        try {
            const uploadFormData = new FormData()
            uploadFormData.append('file', resumeFile)
            uploadFormData.append('upload_preset', 'ml_default')

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,
                {
                    method: 'POST',
                    body: uploadFormData,
                }
            )

            const data = await res.json()
            return data.secure_url
        } catch (error) {
            console.error('Resume upload failed:', error)
            alert('Failed to upload resume')
            return null
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async () => {
        // Validate resume
        let resumeUrl = ''
        if (resumeOption === 'existing') {
            if (!profile?.resumeUrl) {
                alert('No existing resume found. Please upload a new resume.')
                return
            }
            resumeUrl = profile.resumeUrl
        } else {
            if (!resumeFile) {
                alert('Please select a resume file to upload')
                return
            }
            const uploadedUrl = await uploadResume()
            if (!uploadedUrl) {
                return // Upload failed
            }
            resumeUrl = uploadedUrl
        }

        setSubmitting(true)
        try {
            await onSubmit({ coverLetter, resumeUrl })
            setSuccess(true)
        } catch (error) {
            alert('Failed to submit application')
        } finally {
            setSubmitting(false)
        }
    }

    if (success) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <div className="text-center py-6">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Application Submitted!</h3>
                        <p className="text-gray-600 mb-4">
                            Your application has been successfully submitted. Good luck!
                        </p>
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Apply for this Position</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Profile Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-lg">Your Profile</h3>
                            <Link href="/dashboard/candidate/profile">
                                <Button variant="outline" size="sm">
                                    Edit Profile
                                </Button>
                            </Link>
                        </div>

                        {profile ? (
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">{profile.fullName || 'Not provided'}</span>
                                </div>
                                {profile.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>{profile.location}</span>
                                    </div>
                                )}
                                {profile.experience !== undefined && (
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-gray-500" />
                                        <span>{profile.experience} years experience</span>
                                    </div>
                                )}
                                {profile.skills && profile.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {profile.skills.slice(0, 5).map((skill: string) => (
                                            <Badge key={skill} variant="secondary" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {profile.skills.length > 5 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{profile.skills.length - 5} more
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Please complete your profile before applying
                            </p>
                        )}
                    </div>

                    {/* Resume Selection */}
                    <div className="space-y-3">
                        <Label>Resume *</Label>
                        <RadioGroup value={resumeOption} onValueChange={(value: any) => setResumeOption(value)}>
                            {profile?.resumeUrl && (
                                <div className="flex items-center space-x-2 p-3 border rounded-md">
                                    <RadioGroupItem value="existing" id="existing" />
                                    <label htmlFor="existing" className="flex-1 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium">Use existing resume</span>
                                        </div>
                                        <a
                                            href={profile.resumeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline ml-6"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View current resume
                                        </a>
                                    </label>
                                </div>
                            )}

                            <div className="flex items-start space-x-2 p-3 border rounded-md">
                                <RadioGroupItem value="new" id="new" className="mt-1" />
                                <label htmlFor="new" className="flex-1 cursor-pointer">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Upload className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium">Upload new resume</span>
                                    </div>
                                    {resumeOption === 'new' && (
                                        <div className="ml-6 space-y-2">
                                            {resumeFile && (
                                                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                    <span className="text-xs flex-1">{resumeFile.name}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setResumeFile(null)}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                            <Input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleResumeChange}
                                                className="text-sm"
                                            />
                                            <p className="text-xs text-gray-500">
                                                PDF, DOC, DOCX (Max 5MB)
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Cover Letter */}
                    <div className="space-y-2">
                        <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                        <Textarea
                            id="coverLetter"
                            rows={6}
                            placeholder="Tell us why you're a great fit for this position..."
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || uploading || !profile}
                            className="flex-1"
                        >
                            {uploading ? 'Uploading Resume...' : submitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                        <Button variant="outline" onClick={onClose} disabled={submitting || uploading}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
