'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Building, MapPin, Phone, Briefcase, Lock, Mail } from 'lucide-react'

export default function RecruiterProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [formData, setFormData] = useState({
        companyName: '',
        companyWebsite: '',
        phone: '',
        location: '',
        designation: '',
        email: '',
        newPassword: '',
        confirmPassword: '',
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/auth/login')
            return
        }

        try {
            const res = await fetch('/api/recruiter/profile', {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!res.ok) {
                if (res.status === 401) {
                    router.push('/auth/login')
                    return
                }
                throw new Error('Failed to fetch profile')
            }

            const data = await res.json()
            if (data.user) {
                setFormData(prev => ({
                    ...prev,
                    companyName: data.user.companyName || '',
                    companyWebsite: data.user.companyWebsite || '',
                    phone: data.user.phone || '',
                    location: data.user.location || '',
                    designation: data.user.designation || '',
                    email: data.user.email || '',
                }))
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error)
        } finally {
            setFetching(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            alert('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            const token = localStorage.getItem('token')
            const body: any = {
                companyName: formData.companyName,
                companyWebsite: formData.companyWebsite,
                phone: formData.phone,
                location: formData.location,
                designation: formData.designation,
                email: formData.email,
            }

            if (formData.newPassword) {
                body.password = formData.newPassword
            }

            const res = await fetch('/api/recruiter/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            })

            const data = await res.json()

            if (res.ok) {
                alert('Profile updated successfully!')
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    newPassword: '',
                    confirmPassword: ''
                }))
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

    if (fetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="gradient-primary text-white">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/dashboard/recruiter" className="text-2xl font-heading font-bold flex items-center gap-2">
                        <img src="/icon-transparent.png" alt="Hirezium Logo" className="w-8 h-8 object-contain bg-white rounded-full" />
                        <span>Hirezium</span>
                    </Link>
                    <Link href="/dashboard/recruiter" className="text-white hover:text-gray-200">
                        Back to Dashboard
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <h1 className="text-3xl font-heading font-bold mb-8">Recruiter Profile</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Update Profile Details</CardTitle>
                        <CardDescription>Manage your account settings and company information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-gray-500" />
                                    Company Information
                                </h3>
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="companyName"
                                            className="pl-9"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companyWebsite">Website</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="companyWebsite"
                                            className="pl-9"
                                            value={formData.companyWebsite}
                                            onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <User className="w-5 h-5 text-gray-500" />
                                    Personal Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="designation">Designation</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="designation"
                                                className="pl-9"
                                                value={formData.designation}
                                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="phone"
                                                className="pl-9"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="location"
                                            className="pl-9"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-gray-500" />
                                    Account Security
                                </h3>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            className="pl-9"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password (Optional)</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="newPassword"
                                                className="pl-9"
                                                type="password"
                                                placeholder="Leave blank to keep current"
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="confirmPassword"
                                                className="pl-9"
                                                type="password"
                                                placeholder="Confirm new password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                                    {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => router.back()} className="w-full md:w-auto">
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
