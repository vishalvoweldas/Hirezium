import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/analytics/placements/public - Public placement analytics for home page
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const year = searchParams.get('year')
        const includeCompanies = searchParams.get('includeCompanies') !== 'false'

        const yearlyStats = await prisma.placementStats.findMany({
            where: year ? { year: parseInt(year) } : {},
            orderBy: { year: 'asc' },
            select: {
                year: true,
                totalPlaced: true
            }
        })

        // Fetch company stats if requested
        let companyStats = []
        if (includeCompanies) {
            const companyStatsQuery = year
                ? { where: { year: parseInt(year) } }
                : {}

            companyStats = await prisma.companyPlacementStats.findMany({
                ...companyStatsQuery,
                orderBy: [
                    { year: 'desc' },
                    { placedCount: 'desc' }
                ],
                select: {
                    companyName: true,
                    year: true,
                    placedCount: true
                }
            })
        }

        // Get available years for filtering
        const availableYears = await prisma.placementStats.findMany({
            select: { year: true },
            orderBy: { year: 'desc' }
        })

        return NextResponse.json({
            yearlyStats,
            companyStats,
            availableYears: availableYears.map(y => y.year),
            success: true
        })
    } catch (error) {
        console.error('Error fetching public placement analytics:', error)
        return NextResponse.json(
            { error: 'Failed to fetch placement analytics' },
            { status: 500 }
        )
    }
}
