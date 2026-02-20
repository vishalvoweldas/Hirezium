import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole } from '@prisma/client'
import { generateExcel, generatePDF } from '@/lib/export'

// GET /api/admin/export/candidates - Export candidates data (Admin only)
async function exportCandidatesHandler(request: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') || 'excel'
        const location = searchParams.get('location')
        const minExp = searchParams.get('minExperience')
        const maxExp = searchParams.get('maxExperience')

        const where: any = {
            role: UserRole.CANDIDATE,
        }

        const profileWhere: any = {}
        if (location) profileWhere.location = { contains: location, mode: 'insensitive' }
        if (minExp) {
            if (!profileWhere.experience) profileWhere.experience = {}
            profileWhere.experience.gte = parseFloat(minExp)
        }
        if (maxExp) {
            if (!profileWhere.experience) profileWhere.experience = {}
            profileWhere.experience.lte = parseFloat(maxExp)
        }

        if (Object.keys(profileWhere).length > 0) {
            where.candidateProfile = profileWhere
        }

        const candidates = await prisma.user.findMany({
            where,
            include: {
                candidateProfile: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        // Transform data for export
        const exportData = candidates.map(user => {
            const profile = user.candidateProfile
            return {
                Name: profile ? `${profile.firstName} ${profile.lastName}` : 'N/A',
                Email: user.email,
                Phone: profile?.phone || 'N/A',
                Location: profile?.location || 'N/A',
                Experience: profile?.experience ? `${profile.experience} years` : 'N/A',
                'Current Role': profile?.currentRole || 'N/A',
                'Current Company': profile?.currentCompany || 'N/A',
                'Notice Period': profile?.noticePeriod || 'N/A',
                'Current CTC': profile?.currentCtc || 'N/A',
                'Expected CTC': profile?.expectedCtc || 'N/A',
                Skills: profile?.skills?.join(', ') || 'N/A',
                Bio: profile?.bio || 'N/A',
                'Profile Completion': `${profile?.profileCompletion || 0}%`,
                'Joined At': new Date(user.createdAt).toLocaleString(),
            }
        })

        let buffer: Buffer
        let contentType: string
        let filename: string

        if (format === 'pdf') {
            buffer = generatePDF(exportData, 'All Candidates')
            contentType = 'application/pdf'
            filename = 'candidates-export.pdf'
        } else {
            buffer = generateExcel(exportData)
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            filename = 'candidates-export.xlsx'
        }

        return new NextResponse(buffer as any, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })

    } catch (error) {
        console.error('Export candidates error:', error)
        return NextResponse.json(
            { error: 'Failed to export candidates' },
            { status: 500 }
        )
    }
}

export const GET = requireRole([UserRole.ADMIN])(exportCandidatesHandler)
