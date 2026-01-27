import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole } from '@prisma/client'

// GET /api/analytics/placements - Get placement analytics
async function getPlacementsHandler(request: AuthenticatedRequest) {
    try {
        const userId = request.user!.userId
        const userRole = request.user!.role

        // Build query based on role
        const jobFilter = userRole === UserRole.ADMIN
            ? {} // Admin sees all jobs
            : { recruiterId: userId } // Recruiter sees only their jobs

        // Get all jobs with their applications
        const jobs = await prisma.job.findMany({
            where: jobFilter,
            include: {
                applications: {
                    select: {
                        status: true,
                        updatedAt: true,
                    },
                },
            },
        })

        // Calculate placements per job
        const placementsByJob = jobs.map(job => {
            const selectedCount = job.applications.filter(app => app.status === 'SELECTED').length
            const totalApplications = job.applications.length

            return {
                jobId: job.id,
                jobTitle: job.title,
                selectedCount,
                totalApplications,
                conversionRate: totalApplications > 0
                    ? ((selectedCount / totalApplications) * 100).toFixed(2)
                    : '0.00',
            }
        })

        // Calculate total placements
        const totalPlacements = placementsByJob.reduce((sum, job) => sum + job.selectedCount, 0)

        // Get placements by month (last 12 months)
        const twelveMonthsAgo = new Date()
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

        // Get all SELECTED applications
        const selectedApplications = await prisma.application.findMany({
            where: {
                status: 'SELECTED',
                updatedAt: {
                    gte: twelveMonthsAgo,
                },
                job: jobFilter,
            },
            select: {
                updatedAt: true,
            },
        })

        // Group by month
        const monthlyMap = new Map<string, number>()
        selectedApplications.forEach(app => {
            const month = app.updatedAt.toISOString().substring(0, 7) // YYYY-MM
            monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1)
        })

        const placementsByMonth = Array.from(monthlyMap.entries())
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => b.month.localeCompare(a.month))

        return NextResponse.json({
            totalPlacements,
            placementsByJob: placementsByJob.filter(j => j.selectedCount > 0 || j.totalApplications > 0),
            placementsByMonth,
            summary: {
                totalJobs: jobs.length,
                jobsWithPlacements: placementsByJob.filter(j => j.selectedCount > 0).length,
            },
        })
    } catch (error) {
        console.error('Get placements analytics error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch placement analytics' },
            { status: 500 }
        )
    }
}

export const GET = requireRole([UserRole.RECRUITER, UserRole.ADMIN])(getPlacementsHandler)
