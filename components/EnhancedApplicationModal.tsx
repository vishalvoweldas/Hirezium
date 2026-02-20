'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Upload, FileText, X, CheckCircle, User, MapPin, Briefcase, Info } from 'lucide-react'

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

    // Mandatory Profile States
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phone, setPhone] = useState('')
    const [location, setLocation] = useState('')
    const [experience, setExperience] = useState<string>('')
    const [skillsString, setSkillsString] = useState('')
    const [currentCompany, setCurrentCompany] = useState('')
    const [currentRole, setCurrentRole] = useState('')
    const [noticePeriod, setNoticePeriod] = useState('')
    const [currentCtc, setCurrentCtc] = useState('')
    const [expectedCtc, setExpectedCtc] = useState('')

    useEffect(() => {
        if (open && profile) {
            setFirstName(profile.firstName || '')
            setLastName(profile.lastName || '')
            setPhone(profile.phone || '')
            setLocation(profile.location || '')
            setExperience(profile.experience?.toString() || '')
            setSkillsString(profile.skills?.join(', ') || '')
            setCurrentCompany(profile.currentCompany || '')
            setCurrentRole(profile.currentRole || '')
            setNoticePeriod(profile.noticePeriod || '')
            setCurrentCtc(profile.currentCtc || '')
            setExpectedCtc(profile.expectedCtc || '')

            if (!profile.resumeUrl) {
                setResumeOption('new')
            }
        }
    }, [open, profile])

    const expValue = parseFloat(experience) || 0
    const isProfileIncomplete = !firstName || !lastName || !phone || !location || !experience || !skillsString ||
        (expValue > 0 && (!currentCompany || !currentRole || !noticePeriod || !currentCtc || !expectedCtc))

    const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            if (!validTypes.includes(file.type)) {
                alert('Please upload a PDF or DOCX file')
                return
            }
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

    const updateProfile = async (resumeUrl?: string) => {
        try {
            const token = localStorage.getItem('token')
            const skills = skillsString.split(',').map(s => s.trim()).filter(s => s !== '')

            const res = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    phone,
                    location,
                    experience: expValue,
                    skills,
                    resumeUrl: resumeUrl || profile?.resumeUrl || '',
                    currentCompany: expValue > 0 ? currentCompany : undefined,
                    currentRole: expValue > 0 ? currentRole : undefined,
                    noticePeriod: expValue > 0 ? noticePeriod : undefined,
                    currentCtc: expValue > 0 ? currentCtc : undefined,
                    expectedCtc: expValue > 0 ? expectedCtc : undefined,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to update profile')
            }
        } catch (error: any) {
            console.error('Profile update failed:', error)
            throw error
        }
    }

    const handleSubmit = async () => {
        // Validate Mandatory Fields
        if (isProfileIncomplete) {
            alert('Please fill in all mandatory profile details.')
            return
        }

        // Validate resume
        let finalResumeUrl = ''
        if (resumeOption === 'existing') {
            if (!profile?.resumeUrl) {
                alert('No existing resume found. Please upload a new resume.')
                return
            }
            finalResumeUrl = profile.resumeUrl
        } else {
            if (!resumeFile) {
                alert('Please select a resume file to upload')
                return
            }
            const uploadedUrl = await uploadResume()
            if (!uploadedUrl) {
                return // Upload failed
            }
            finalResumeUrl = uploadedUrl
        }

        setSubmitting(true)
        try {
            // Check if profile needs updating (simplified: always update if we have new values)
            await updateProfile(finalResumeUrl)

            await onSubmit({ coverLetter, resumeUrl: finalResumeUrl })
            setSuccess(true)
        } catch (error: any) {
            alert(error.message || 'Failed to submit application')
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
                            Your application has been successfully submitted and your profile has been updated. Good luck!
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
                    {/* Mandatory Profile Fields (if missing) */}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg space-y-4">
                        <div className="flex items-center gap-2 text-blue-800 mb-1">
                            <Info className="w-5 h-5" />
                            <h3 className="font-semibold">Complete Your Profile</h3>
                        </div>
                        <p className="text-sm text-blue-600">
                            Please ensure your core profile details are correct. These will be saved to your profile.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 234 567 890"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="City, Country"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="experience">Years of Experience *</Label>
                                <Input
                                    id="experience"
                                    type="number"
                                    step="0.5"
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    placeholder="2.5"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="skillsString">Skills (comma separated) *</Label>
                                <Input
                                    id="skillsString"
                                    value={skillsString}
                                    onChange={(e) => setSkillsString(e.target.value)}
                                    placeholder="React, Next.js, TypeScript"
                                    required
                                />
                            </div>
                        </div>

                        {expValue > 0 && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentCompany">Current Company *</Label>
                                        <Input
                                            id="currentCompany"
                                            value={currentCompany}
                                            onChange={(e) => setCurrentCompany(e.target.value)}
                                            placeholder="Google"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currentRole">Current Role *</Label>
                                        <Input
                                            id="currentRole"
                                            value={currentRole}
                                            onChange={(e) => setCurrentRole(e.target.value)}
                                            placeholder="Software Engineer"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="noticePeriod">Notice Period *</Label>
                                        <Input
                                            id="noticePeriod"
                                            value={noticePeriod}
                                            onChange={(e) => setNoticePeriod(e.target.value)}
                                            placeholder="30 Days"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentCtc">Current CTC *</Label>
                                        <Input
                                            id="currentCtc"
                                            value={currentCtc}
                                            onChange={(e) => setCurrentCtc(e.target.value)}
                                            placeholder="12 LPA"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expectedCtc">Expected CTC *</Label>
                                        <Input
                                            id="expectedCtc"
                                            value={expectedCtc}
                                            onChange={(e) => setExpectedCtc(e.target.value)}
                                            placeholder="18 LPA"
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Resume Selection */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Resume *</Label>
                        <RadioGroup value={resumeOption} onValueChange={(value: any) => setResumeOption(value)}>
                            {profile?.resumeUrl && (
                                <div className="flex items-center space-x-2 p-3 border rounded-md bg-white">
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

                            <div className="flex items-start space-x-2 p-3 border rounded-md bg-white">
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
                        <Label htmlFor="coverLetter" className="text-base font-semibold">Cover Letter (Optional)</Label>
                        <Textarea
                            id="coverLetter"
                            rows={4}
                            placeholder="Tell us why you're a great fit for this position..."
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || uploading || !profile}
                            className="flex-1"
                            size="lg"
                        >
                            {uploading ? 'Uploading Resume...' : submitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                        <Button variant="outline" onClick={onClose} disabled={submitting || uploading} size="lg">
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
