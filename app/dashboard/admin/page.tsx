'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Briefcase, FileText, UserCheck, LogOut, Settings } from 'lucide-react'

import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingRecruiters: 0,
        totalJobs: 0,
        totalApplications: 0,
    })

    const { user, loading: authLoading, logout } = useAuth()

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/auth/login')
            } else if (user.role !== 'ADMIN') {
                router.push('/candidate/home')
            } else {
                fetchStats()
            }
        }
    }, [user, authLoading, router])

    const fetchStats = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/admin/dashboard-stats', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error('Failed to fetch stats')
            const data = await res.json()
            setStats(data)
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="gradient-primary text-white">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-0 text-lg md:text-2xl font-heading font-bold">
                            <img src="/icon-transparent.png" alt="Hirezium Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                            <span>Hirezium Admin</span>
                        </Link>
                        <Button variant="ghost" className="text-white hover:bg-white/10" onClick={logout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-heading font-bold mb-8">Admin Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Recruiters</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingRecruiters}</div>
                            <p className="text-xs text-muted-foreground">Awaiting approval</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalJobs}</div>
                            <p className="text-xs text-muted-foreground">Across all recruiters</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalApplications}</div>
                            <p className="text-xs text-muted-foreground">All applications</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers || 'N/A'}</div>
                            <p className="text-xs text-muted-foreground">All roles</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="card-hover cursor-pointer" onClick={() => router.push('/dashboard/admin/recruiters')}>
                        <CardHeader>
                            <UserCheck className="w-12 h-12 text-primary-dark mb-4" />
                            <CardTitle>Manage Recruiters</CardTitle>
                            <p className="text-gray-600">Approve or reject recruiter registrations</p>
                            {stats.pendingRecruiters > 0 && (
                                <Badge variant="destructive" className="w-fit mt-2">
                                    {stats.pendingRecruiters} Pending
                                </Badge>
                            )}
                        </CardHeader>
                    </Card>

                    <Card className="card-hover cursor-pointer" onClick={() => router.push('/dashboard/admin/jobs')}>
                        <CardHeader>
                            <Briefcase className="w-12 h-12 text-primary-dark mb-4" />
                            <CardTitle>Manage All Jobs</CardTitle>
                            <p className="text-gray-600">View and manage all job postings</p>
                        </CardHeader>
                    </Card>

                    <Card className="card-hover cursor-pointer" onClick={() => router.push('/dashboard/admin/applicants')}>
                        <CardHeader>
                            <FileText className="w-12 h-12 text-primary-dark mb-4" />
                            <CardTitle>View All Applicants</CardTitle>
                            <p className="text-gray-600">System-wide applicant management</p>
                        </CardHeader>
                    </Card>

                    <Card className="card-hover cursor-pointer" onClick={() => router.push('/dashboard/admin/candidates')}>
                        <CardHeader>
                            <Users className="w-12 h-12 text-primary-dark mb-4" />
                            <CardTitle>Manage Candidates</CardTitle>
                            <p className="text-gray-600">View and export all candidate profile data</p>
                        </CardHeader>
                    </Card>

                    <Card className="card-hover cursor-pointer" onClick={() => router.push('/dashboard/admin/settings')}>
                        <CardHeader>
                            <Settings className="w-12 h-12 text-primary-dark mb-4" />
                            <CardTitle>Account Settings</CardTitle>
                            <p className="text-gray-600">Update admin email and change password</p>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    )
}
