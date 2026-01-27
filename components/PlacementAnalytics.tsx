'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import YearlyPlacementsChart from '@/components/charts/YearlyPlacementsChart'
import CompanyPlacementsChart from '@/components/charts/CompanyPlacementsChart'
import { TrendingUp } from 'lucide-react'

interface PlacementData {
    yearlyStats: Array<{ year: number; totalPlaced: number }>
    companyStats: Array<{ companyName: string; year: number; placedCount: number }>
    availableYears: number[]
}

export default function PlacementAnalytics() {
    const [data, setData] = useState<PlacementData | null>(null)
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchPlacementData()
    }, [])

    const fetchPlacementData = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/analytics/placements/public?includeCompanies=true')

            if (!response.ok) {
                throw new Error('Failed to fetch placement data')
            }

            const result = await response.json()
            setData(result)

            // Set selected year to the most recent year with data
            if (result.availableYears && result.availableYears.length > 0) {
                setSelectedYear(result.availableYears[0])
            }
        } catch (err) {
            console.error('Error fetching placement analytics:', err)
            setError('Failed to load placement analytics')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="content-container">
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (error || !data) {
        return (
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="content-container">
                        <div className="text-center text-gray-500 py-12">
                            {error || 'No placement data available'}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    // Filter company stats by selected year
    const companyDataForYear = data.companyStats.filter(stat => stat.year === selectedYear)

    // Calculate total placements across all years
    const totalPlacements = data.yearlyStats.reduce((sum, stat) => sum + stat.totalPlaced, 0)

    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="content-container">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-600">Placement Success</span>
                        </div>
                        <h2 className="text-4xl font-heading font-bold text-primary-dark mb-4">
                            Candidates Placed
                        </h2>
                        <p className="text-lg text-secondary-dark max-w-2xl mx-auto">
                            Track our success in connecting talented professionals with leading companies
                        </p>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <Card className="card-modern">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-600 mb-2">
                                        {totalPlacements.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-secondary-dark">Total Placements</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="card-modern">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-purple-600 mb-2">
                                        {data.availableYears.length}
                                    </div>
                                    <div className="text-sm text-secondary-dark">Years of Success</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="card-modern">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-green-600 mb-2">
                                        {companyDataForYear.length}
                                    </div>
                                    <div className="text-sm text-secondary-dark">Partner Companies</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Yearly Placements Chart */}
                        <Card className="card-modern">
                            <CardHeader>
                                <CardTitle className="text-xl font-heading font-semibold text-primary-dark">
                                    Year-wise Placements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <YearlyPlacementsChart data={data.yearlyStats} />
                            </CardContent>
                        </Card>

                        {/* Company Placements Chart */}
                        <Card className="card-modern">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-heading font-semibold text-primary-dark">
                                        Top Companies
                                    </CardTitle>
                                    <Select
                                        value={selectedYear.toString()}
                                        onValueChange={(value) => setSelectedYear(parseInt(value))}
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {data.availableYears.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CompanyPlacementsChart
                                    data={companyDataForYear}
                                    year={selectedYear}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}
