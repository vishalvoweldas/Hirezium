'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, Search, X, MapPin, Briefcase, GraduationCap } from 'lucide-react'
import { getStatusColor } from '@/lib/utils'

export default function ManageCandidatesPage() {
    const [candidates, setCandidates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [location, setLocation] = useState('')
    const [minExp, setMinExp] = useState('')
    const [maxExp, setMaxExp] = useState('')

    useEffect(() => {
        fetchCandidates()
    }, [])

    const fetchCandidates = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/admin/candidates', {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            setCandidates(data.candidates || [])
        } catch (error) {
            console.error('Failed to fetch candidates:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async (format: string) => {
        const token = localStorage.getItem('token')
        let url = `/api/admin/export/candidates?format=${format}`
        if (location) url += `&location=${location}`
        if (minExp) url += `&minExperience=${minExp}`
        if (maxExp) url += `&maxExperience=${maxExp}`

        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const blob = await res.blob()
            const blobUrl = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = blobUrl
            a.download = `candidates-export.${format === 'pdf' ? 'pdf' : 'xlsx'}`
            a.click()
            window.URL.revokeObjectURL(blobUrl)
        } catch (error) {
            alert('Failed to export data')
        }
    }

    const filteredCandidates = candidates.filter(candidate => {
        const profile = candidate.candidateProfile
        const matchesSearch = !search ||
            candidate.email.toLowerCase().includes(search.toLowerCase()) ||
            `${profile?.firstName} ${profile?.lastName}`.toLowerCase().includes(search.toLowerCase())

        const matchesLocation = !location ||
            profile?.location?.toLowerCase().includes(location.toLowerCase())

        const matchesExp = (!minExp || (profile?.experience || 0) >= parseFloat(minExp)) &&
            (!maxExp || (profile?.experience || 0) <= parseFloat(maxExp))

        return matchesSearch && matchesLocation && matchesExp
    })

    const clearFilters = () => {
        setSearch('')
        setLocation('')
        setMinExp('')
        setMaxExp('')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="gradient-primary text-white">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/dashboard/admin" className="flex items-center gap-0 text-lg md:text-2xl font-heading font-bold">
                        <img src="/icon-transparent.png" alt="Hirezium Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                        <span>Hirezium Admin</span>
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-3xl font-heading font-bold">Manage Candidates</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleExport('excel')}>
                            <Download className="w-4 h-4 mr-2" />
                            Export Excel
                        </Button>
                        <Button variant="outline" onClick={() => handleExport('pdf')}>
                            <Download className="w-4 h-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <Label className="mb-2 block">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Name or email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="mb-2 block">Location</Label>
                                <Input
                                    placeholder="City or state..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label className="mb-2 block">Min Exp (Yrs)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={minExp}
                                        onChange={(e) => setMinExp(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label className="mb-2 block">Max Exp (Yrs)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={maxExp}
                                        onChange={(e) => setMaxExp(e.target.value)}
                                    />
                                </div>
                            </div>
                            {(search || location || minExp || maxExp) && (
                                <Button variant="ghost" onClick={clearFilters} className="text-gray-500">
                                    <X className="w-4 h-4 mr-2" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading candidates...</p>
                    </div>
                ) : filteredCandidates.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-gray-500">
                            No candidates found matching your filters.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCandidates.map((candidate) => {
                            const profile = candidate.candidateProfile
                            return (
                                <Card key={candidate.id} className="card-hover">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl">
                                                    {profile ? `${profile.firstName} ${profile.lastName}` : 'N/A'}
                                                </CardTitle>
                                                <p className="text-sm text-gray-500">{candidate.email}</p>
                                            </div>
                                            <Badge variant="outline" className="bg-blue-50">
                                                {profile?.profileCompletion || 0}% Complete
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                {profile?.location || 'Not set'}
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Briefcase className="w-4 h-4 mr-2" />
                                                {profile?.experience ? `${profile.experience}Y Exp` : 'N/A'}
                                            </div>
                                        </div>

                                        {profile?.currentRole && (
                                            <div className="text-sm">
                                                <span className="font-semibold">Role: </span>
                                                {profile.currentRole}
                                            </div>
                                        )}

                                        {profile?.skills && profile.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {profile.skills.slice(0, 5).map((skill: string, i: number) => (
                                                    <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {profile.skills.length > 5 && (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        +{profile.skills.length - 5}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        <div className="pt-2 border-t text-xs text-gray-400">
                                            Joined on: {new Date(candidate.createdAt).toLocaleDateString()}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
