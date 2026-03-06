import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

async function handler(request: AuthenticatedRequest) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: request.user!.userId },
            select: {
                id: true,
                email: true,
                role: true,
                approvalStatus: true,
                candidateProfile: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        location: true,
                        profileCompletion: true,
                    }
                },
                recruiterProfile: {
                    select: {
                        id: true,
                        companyName: true,
                        companyWebsite: true,
                        phone: true,
                        location: true,
                        designation: true,
                    }
                },
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                approvalStatus: user.approvalStatus,
                profile: user.candidateProfile || user.recruiterProfile,
            },
        })
    } catch (error) {
        console.error('Get user error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        )
    }
}

export const GET = requireAuth(handler)
