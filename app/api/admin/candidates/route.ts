import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole } from '@prisma/client'

// GET /api/admin/candidates - List all candidates with filters (Admin only)
async function getCandidatesHandler(request: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const location = searchParams.get('location')
        const minExp = searchParams.get('minExperience')
        const maxExp = searchParams.get('maxExperience')
        const search = searchParams.get('search') // name or email

        const where: any = {
            role: UserRole.CANDIDATE,
        }

        const profileWhere: any = {}

        if (location) {
            profileWhere.location = { contains: location, mode: 'insensitive' }
        }

        if (minExp || maxExp) {
            profileWhere.experience = {}
            if (minExp) profileWhere.experience.gte = parseFloat(minExp)
            if (maxExp) profileWhere.experience.lte = parseFloat(maxExp)
        }

        if (Object.keys(profileWhere).length > 0) {
            where.candidateProfile = profileWhere
        }

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                {
                    candidateProfile: {
                        OR: [
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
            ]
        }

        const candidates = await prisma.user.findMany({
            where,
            include: {
                candidateProfile: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ candidates })
    } catch (error) {
        console.error('Get candidates error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch candidates' },
            { status: 500 }
        )
    }
}

export const GET = requireRole([UserRole.ADMIN])(getCandidatesHandler)
