'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Briefcase, FileText, Bookmark, User, TrendingUp, Award } from 'lucide-react'

export default function CandidateHomePage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState({
        appliedJobs: 0,
        savedJobs: 0,
        profileCompletion: 0,
    })
    const [searchKeyword, setSearchKeyword] = useState('')
    const [searchLocation, setSearchLocation] = useState('')
    const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])

    useEffect(() => {
        fetchUserData()
        fetchStats()
        fetchRecommendedJobs()
    }, [])

    const fetchUserData = async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error)
        }
    }

    const fetchStats = async () => {
        const token = localStorage.getItem('token')
        try {
            const [applicationsRes, savedRes, userRes] = await Promise.all([
                fetch('/api/applications', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch('/api/saved-jobs', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ])

            const applications = await applicationsRes.json()
            const saved = await savedRes.json()
            const userData = await userRes.json()

            setStats({
                appliedJobs: applications.applications?.length || 0,
                savedJobs: saved.savedJobs?.length || 0,
                profileCompletion: userData.user?.profile?.profileCompletion || 0,
            })
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }

    const fetchRecommendedJobs = async () => {
        try {
            const res = await fetch('/api/jobs?limit=6')
            if (res.ok) {
                const data = await res.json()
                setRecommendedJobs(data.jobs?.slice(0, 6) || [])
            }
        } catch (error) {
            console.error('Failed to fetch recommended jobs:', error)
        }
    }

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (searchKeyword) params.set('keyword', searchKeyword)
        if (searchLocation) params.set('location', searchLocation)
        router.push(`/candidate/jobs?${params.toString()}`)
    }

    const getUserName = () => {
        if (user?.profile?.firstName && user?.profile?.lastName) {
            return `${user.profile.firstName} ${user.profile.lastName}`
        }
        return user?.email?.split('@')[0] || 'there'
    }

    return (
        <div className="min-h-screen gradient-primary">
            {/* Hero Section */}
            <section className="text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                            Welcome back, {getUserName()}! 👋
                        </h1>
                        <p className="text-xl text-on-gradient-muted mb-8">
                            Ready to find your next opportunity?
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white rounded-lg p-2 flex flex-col md:flex-row gap-2 shadow-2xl">
                            <div className="flex-1 flex items-center px-4 py-2 border-r">
                                <Search className="text-gray-400 mr-2" />
                                <Input
                                    type="text"
                                    placeholder="Job title or keyword"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="flex-1 outline-none border-none text-gray-800"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <div className="flex-1 flex items-center px-4 py-2">
                                <MapPin className="text-gray-400 mr-2" />
                                <Input
                                    type="text"
                                    placeholder="Location"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    className="flex-1 outline-none border-none text-gray-800"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button
                                size="lg"
                                className="w-full md:w-auto btn-primary self-center"
                                onClick={handleSearch}
                            >
                                Search Jobs
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-on-gradient-muted mb-1">Profile Completion</p>
                                        <p className="text-3xl font-bold">{stats.profileCompletion}%</p>
                                    </div>
                                    <User className="w-12 h-12 text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-on-gradient-muted mb-1">Applied Jobs</p>
                                        <p className="text-3xl font-bold">{stats.appliedJobs}</p>
                                    </div>
                                    <FileText className="w-12 h-12 text-green-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-on-gradient-muted mb-1">Saved Jobs</p>
                                        <p className="text-3xl font-bold">{stats.savedJobs}</p>
                                    </div>
                                    <Bookmark className="w-12 h-12 text-purple-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Recommended Jobs Section */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="bg-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-heading font-bold text-white">
                                Recommended Jobs
                            </h2>
                            <Button
                                variant="link"
                                onClick={() => router.push('/candidate/jobs')}
                                className="text-blue-400 hover:text-blue-300"
                            >
                                View All →
                            </Button>
                        </div>

                        {recommendedJobs.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recommendedJobs.map((job) => (
                                    <Card
                                        key={job.id}
                                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer"
                                        onClick={() => router.push(`/jobs/${job.id}`)}
                                    >
                                        <CardHeader>
                                            <CardTitle className="text-lg">{job.title}</CardTitle>
                                            <p className="text-sm text-on-gradient-muted">{job.location}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2 text-sm text-on-gradient-muted mb-2">
                                                <Briefcase className="w-4 h-4" />
                                                <span>{job.jobType}</span>
                                            </div>
                                            {job.salary && (
                                                <p className="text-sm font-semibold text-green-400">{job.salary}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-on-gradient-muted">
                                <Briefcase className="w-16 h-16 mx-auto mb-4 text-white/30" />
                                <p>No recommended jobs available at the moment.</p>
                                <Button
                                    variant="secondary"
                                    className="mt-4"
                                    onClick={() => router.push('/candidate/jobs')}
                                >
                                    Browse All Jobs
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Quick Actions Section */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="bg-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm border border-white/10">
                        <h2 className="text-2xl font-heading font-bold text-white mb-6">
                            Quick Actions
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer"
                                onClick={() => router.push('/candidate/profile')}
                            >
                                <CardHeader>
                                    <User className="w-12 h-12 text-blue-400 mb-4" />
                                    <CardTitle>Update Profile</CardTitle>
                                    <p className="text-sm text-on-gradient-muted">
                                        Keep your profile up to date to attract recruiters
                                    </p>
                                </CardHeader>
                            </Card>

                            <Card
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer"
                                onClick={() => router.push('/candidate/applied')}
                            >
                                <CardHeader>
                                    <FileText className="w-12 h-12 text-green-400 mb-4" />
                                    <CardTitle>My Applications</CardTitle>
                                    <p className="text-sm text-on-gradient-muted">
                                        Track the status of your job applications
                                    </p>
                                </CardHeader>
                            </Card>

                            <Card
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer"
                                onClick={() => router.push('/candidate/saved')}
                            >
                                <CardHeader>
                                    <Bookmark className="w-12 h-12 text-purple-400 mb-4" />
                                    <CardTitle>Saved Jobs</CardTitle>
                                    <p className="text-sm text-on-gradient-muted">
                                        View jobs you've saved for later
                                    </p>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Stats Section */}
            <section className="py-8 mb-8">
                <div className="container mx-auto px-4">
                    <div className="bg-white/10 border-white/20 rounded-2xl p-8 backdrop-blur-md">
                        <h2 className="text-2xl font-heading font-bold text-white mb-8 text-center">
                            Join Thousands of Successful Candidates
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div>
                                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-blue-400" />
                                <p className="text-3xl font-bold text-white">10k+</p>
                                <p className="text-sm text-on-gradient-muted">Candidates Placed</p>
                            </div>
                            <div>
                                <Briefcase className="w-12 h-12 mx-auto mb-2 text-green-400" />
                                <p className="text-3xl font-bold text-white">500+</p>
                                <p className="text-sm text-on-gradient-muted">Partner Companies</p>
                            </div>
                            <div>
                                <Award className="w-12 h-12 mx-auto mb-2 text-purple-400" />
                                <p className="text-3xl font-bold text-white">95%</p>
                                <p className="text-sm text-on-gradient-muted">Success Rate</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-white py-12 border-t border-white/10">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        {/* Brand Section */}
                        <div>
                            <div className="flex items-center gap-0 mb-4">
                                <img src="/icon-transparent.png" alt="Hirezium Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                                <h3 className="text-2xl font-heading font-bold">Hirezium</h3>
                            </div>
                            <p className="text-on-gradient-muted">
                                Connecting talented professionals with their dream careers.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-on-gradient-muted">
                                <li>
                                    <Link href="/candidate/jobs" className="hover:text-white transition-colors">
                                        Browse Jobs
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/candidate/profile" className="hover:text-white transition-colors">
                                        My Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/candidate/applied" className="hover:text-white transition-colors">
                                        My Applications
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Social Media */}
                        <div>
                            <h4 className="font-semibold mb-4">Follow Us</h4>
                            <div className="flex gap-4">
                                <a
                                    href="https://youtube.com/@hirezium?si=4S8Gza6YAvI3SgIu"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                                    aria-label="YouTube"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://www.instagram.com/hirezium?igsh=aW95Z2p0NDFqaDRv"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                                    aria-label="Instagram"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/veeresh-voweldas-711945267"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                                    aria-label="LinkedIn"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="text-center pt-8 border-t border-white/10">
                        <p className="text-on-gradient-muted">
                            © 2024 Hirezium. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
