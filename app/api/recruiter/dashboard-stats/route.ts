import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole } from '@prisma/client'

async function handler(request: AuthenticatedRequest) {
    try {
        const recruiterId = request.user!.userId

        // Execute all stats queries in parallel
        const [totalJobs, activeJobs, applicantsResult] = await Promise.all([
            prisma.job.count({
                where: { recruiterId }
            }),
            prisma.job.count({
                where: { recruiterId, isActive: true }
            }),
            prisma.application.count({
                where: {
                    job: {
                        recruiterId
                    }
                }
            })
        ])

        return NextResponse.json({
            totalJobs,
            activeJobs,
            totalApplicants: applicantsResult,
        })
    } catch (error) {
        console.error('Recruiter stats error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        )
    }
}

export const GET = requireRole([UserRole.RECRUITER, UserRole.ADMIN])(handler)
