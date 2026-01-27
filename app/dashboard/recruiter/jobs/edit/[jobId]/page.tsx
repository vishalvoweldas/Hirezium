'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

export default function EditJobPage() {
    const router = useRouter()
    const params = useParams()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        jobType: 'FULL_TIME',
        experience: '',
        skills: [] as string[],
        salary: '',
        isRemote: false,
        stages: 1,
        deadline: '',
    })
    const [newSkill, setNewSkill] = useState('')

    useEffect(() => {
        fetchJob()
    }, [])

    const fetchJob = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/jobs/${params.jobId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const job = await res.json()

            setFormData({
                title: job.title || '',
                description: job.description || '',
                location: job.location || '',
                jobType: job.jobType || 'FULL_TIME',
                experience: job.experience || '',
                skills: job.skills || [],
                salary: job.salary || '',
                isRemote: job.isRemote || false,
                stages: job.stages || 1,
                deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
            })
        } catch (error) {
            console.error('Failed to fetch job:', error)
            alert('Failed to load job details')
        } finally {
            setFetching(false)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/jobs/${params.jobId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                alert('Job updated successfully!')
                router.push('/dashboard/recruiter/jobs')
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to update job')
            }
        } catch (error) {
            alert('Failed to update job')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
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

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-heading font-bold mb-8">Edit Job</h1>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Job Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Senior Software Engineer"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location *</Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g. San Francisco, CA"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Job Description *</Label>
                                <Textarea
                                    id="description"
                                    rows={8}
                                    placeholder="Describe the role, responsibilities, and requirements..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="jobType">Job Type *</Label>
                                    <Select value={formData.jobType} onValueChange={(value) => setFormData({ ...formData, jobType: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                            <SelectItem value="PART_TIME">Part Time</SelectItem>
                                            <SelectItem value="CONTRACT">Contract</SelectItem>
                                            <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="experience">Experience Required *</Label>
                                    <Input
                                        id="experience"
                                        placeholder="e.g. 2-5 years"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="salary">Salary Range</Label>
                                    <Input
                                        id="salary"
                                        placeholder="e.g. $80k - $120k"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stages">Number of Interview Stages *</Label>
                                    <Input
                                        id="stages"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.stages}
                                        onChange={(e) => setFormData({ ...formData, stages: parseInt(e.target.value) || 1 })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deadline">Application Deadline</Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Required Skills *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a skill"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                    />
                                    <Button type="button" onClick={handleAddSkill}>Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.skills.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="cursor-pointer">
                                            {skill}
                                            <X className="w-3 h-3 ml-1" onClick={() => handleRemoveSkill(skill)} />
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isRemote"
                                    checked={formData.isRemote}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isRemote: checked as boolean })}
                                />
                                <Label htmlFor="isRemote" className="cursor-pointer">
                                    This is a remote position
                                </Label>
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Job'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
