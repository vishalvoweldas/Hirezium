import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole, ApprovalStatus } from '@prisma/client'

// GET /api/admin/recruiters - List pending recruiters (Admin only)
async function getRecruitersHandler(request: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'PENDING'

        const recruiters = await prisma.user.findMany({
            where: {
                role: UserRole.RECRUITER,
                approvalStatus: status as ApprovalStatus,
            },
            include: {
                recruiterProfile: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ recruiters })
    } catch (error) {
        console.error('Get recruiters error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch recruiters' },
            { status: 500 }
        )
    }
}

// PUT /api/admin/recruiters - Approve/Reject recruiter (Admin only)
async function updateRecruiterHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json()
        const { userId, approvalStatus } = body

        if (!userId || !approvalStatus) {
            return NextResponse.json(
                { error: 'User ID and approval status are required' },
                { status: 400 }
            )
        }

        if (!['APPROVED', 'REJECTED'].includes(approvalStatus)) {
            return NextResponse.json(
                { error: 'Invalid approval status' },
                { status: 400 }
            )
        }

        // Update recruiter status
        const user = await prisma.user.update({
            where: { id: userId },
            data: { approvalStatus: approvalStatus as ApprovalStatus },
            include: {
                recruiterProfile: true,
            },
        })

        return NextResponse.json({
            message: `Recruiter ${approvalStatus.toLowerCase()} successfully`,
            user,
        })
    } catch (error) {
        console.error('Update recruiter error:', error)
        return NextResponse.json(
            { error: 'Failed to update recruiter status' },
            { status: 500 }
        )
    }
}

export const GET = requireRole([UserRole.ADMIN])(getRecruitersHandler)
export const PUT = requireRole([UserRole.ADMIN])(updateRecruiterHandler)
