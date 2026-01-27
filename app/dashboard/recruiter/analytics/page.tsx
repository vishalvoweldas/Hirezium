'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Users, Briefcase, Award } from 'lucide-react'

interface PlacementData {
    totalPlacements: number
    placementsByJob: Array<{
        jobId: string
        jobTitle: string
        selectedCount: number
        totalApplications: number
        conversionRate: string
    }>
    placementsByMonth: Array<{
        month: string
        count: number
    }>
    summary: {
        totalJobs: number
        jobsWithPlacements: number
    }
}

export default function AnalyticsPage() {
    const [data, setData] = useState<PlacementData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/analytics/placements', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (res.ok) {
                const analyticsData = await res.json()
                setData(analyticsData)
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
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
                    <p>Loading analytics...</p>
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
                <h1 className="text-3xl font-heading font-bold mb-8">Placement Analytics</h1>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Placements</p>
                                    <p className="text-3xl font-bold text-green-600">{data?.totalPlacements || 0}</p>
                                </div>
                                <Award className="w-12 h-12 text-green-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Jobs</p>
                                    <p className="text-3xl font-bold text-blue-600">{data?.summary.totalJobs || 0}</p>
                                </div>
                                <Briefcase className="w-12 h-12 text-blue-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Jobs with Placements</p>
                                    <p className="text-3xl font-bold text-purple-600">{data?.summary.jobsWithPlacements || 0}</p>
                                </div>
                                <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Success Rate</p>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {data?.summary.totalJobs
                                            ? Math.round((data.summary.jobsWithPlacements / data.summary.totalJobs) * 100)
                                            : 0}%
                                    </p>
                                </div>
                                <Users className="w-12 h-12 text-orange-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Placements by Job Chart */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Placements by Job</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data && data.placementsByJob.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={data.placementsByJob.slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="jobTitle"
                                        angle={-45}
                                        textAnchor="end"
                                        height={120}
                                        interval={0}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="selectedCount" fill="#10b981" name="Selected Candidates" />
                                    <Bar dataKey="totalApplications" fill="#6366f1" name="Total Applications" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No placement data available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Placements Over Time */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Placements Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data && data.placementsByMonth.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.placementsByMonth.reverse()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} name="Placements" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No monthly data available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Detailed Job List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Job Performance Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Job Title</th>
                                        <th className="text-right py-3 px-4">Applications</th>
                                        <th className="text-right py-3 px-4">Selected</th>
                                        <th className="text-right py-3 px-4">Conversion Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.placementsByJob.map((job) => (
                                        <tr key={job.jobId} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">{job.jobTitle}</td>
                                            <td className="text-right py-3 px-4">{job.totalApplications}</td>
                                            <td className="text-right py-3 px-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {job.selectedCount}
                                                </span>
                                            </td>
                                            <td className="text-right py-3 px-4">{job.conversionRate}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
