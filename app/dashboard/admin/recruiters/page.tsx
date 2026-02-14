'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'

export default function ManageRecruitersPage() {
    const [recruiters, setRecruiters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRecruiters()
    }, [])

    const fetchRecruiters = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/admin/recruiters?status=PENDING', {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            setRecruiters(data.recruiters || [])
        } catch (error) {
            console.error('Failed to fetch recruiters:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApproval = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
        const token = localStorage.getItem('token')
        try {
            await fetch('/api/admin/recruiters', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId, approvalStatus: status }),
            })
            fetchRecruiters()
        } catch (error) {
            alert('Failed to update recruiter status')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="gradient-primary text-white">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/dashboard/admin" className="text-2xl font-heading font-bold">
                        Hirezium Admin
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-heading font-bold mb-8">Manage Recruiters</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : recruiters.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500">No pending recruiter approvals</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {recruiters.map((recruiter) => (
                            <Card key={recruiter.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl">{recruiter.recruiterProfile?.companyName || 'Company'}</CardTitle>
                                            <p className="text-gray-600">{recruiter.email}</p>
                                            {recruiter.recruiterProfile?.companyWebsite && (
                                                <a
                                                    href={recruiter.recruiterProfile.companyWebsite}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary-dark hover:underline"
                                                >
                                                    {recruiter.recruiterProfile.companyWebsite}
                                                </a>
                                            )}
                                        </div>
                                        <Badge variant="secondary">PENDING</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        {recruiter.recruiterProfile?.designation && (
                                            <div>
                                                <p className="text-sm text-gray-500">Designation</p>
                                                <p className="font-medium">{recruiter.recruiterProfile.designation}</p>
                                            </div>
                                        )}
                                        {recruiter.recruiterProfile?.location && (
                                            <div>
                                                <p className="text-sm text-gray-500">Location</p>
                                                <p className="font-medium">{recruiter.recruiterProfile.location}</p>
                                            </div>
                                        )}
                                        {recruiter.recruiterProfile?.phone && (
                                            <div>
                                                <p className="text-sm text-gray-500">Phone</p>
                                                <p className="font-medium">{recruiter.recruiterProfile.phone}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="default"
                                            onClick={() => handleApproval(recruiter.id, 'APPROVED')}
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleApproval(recruiter.id, 'REJECTED')}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Reject
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
