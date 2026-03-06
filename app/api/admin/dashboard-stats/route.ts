import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole, ApprovalStatus } from '@prisma/client'

async function handler(request: AuthenticatedRequest) {
    try {
        // Execute all admin stats queries in parallel
        const [totalUsers, pendingRecruiters, totalJobs, totalApplications] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: {
                    role: UserRole.RECRUITER,
                    approvalStatus: ApprovalStatus.PENDING
                }
            }),
            prisma.job.count(),
            prisma.application.count()
        ])

        return NextResponse.json({
            totalUsers,
            pendingRecruiters,
            totalJobs,
            totalApplications,
        })
    } catch (error) {
        console.error('Admin stats error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch admin stats' },
            { status: 500 }
        )
    }
}

export const GET = requireRole([UserRole.ADMIN])(handler)
