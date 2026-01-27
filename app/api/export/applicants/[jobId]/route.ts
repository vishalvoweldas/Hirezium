import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole } from '@prisma/client'
import { generateExcel, generatePDF, filterApplicantData, ApplicantData, ExportFilters } from '@/lib/export'
import { getPreviewResumeUrl } from '@/lib/utils'

// GET /api/export/applicants/[jobId] - Export applicants data (Recruiter/Admin)
async function exportApplicantsHandler(
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params
        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') || 'excel' // excel or pdf
        const includePhone = searchParams.get('includePhone') === 'true'
        const includeEmail = searchParams.get('includeEmail') === 'true'
        const includeResume = searchParams.get('includeResume') === 'true'
        const includeFull = searchParams.get('includeFull') === 'true'

        // Check if job exists
        const job = await prisma.job.findUnique({
            where: { id: jobId },
        })

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        // Check permissions (job owner or admin)
        if (
            job.recruiterId !== request.user!.userId &&
            request.user!.role !== UserRole.ADMIN
        ) {
            return NextResponse.json(
                { error: 'Forbidden - You can only export applicants for your jobs' },
                { status: 403 }
            )
        }

        // Fetch applicants
        const applications = await prisma.application.findMany({
            where: { jobId },
            include: {
                candidate: {
                    include: {
                        candidateProfile: true,
                    },
                },
            },
            orderBy: { appliedAt: 'desc' },
        })

        if (applications.length === 0) {
            return NextResponse.json(
                { error: 'No applicants found for this job' },
                { status: 404 }
            )
        }


        // Transform data
        const applicantsData: ApplicantData[] = applications.map((app: any) => ({
            name: app.candidate.candidateProfile
                ? `${app.candidate.candidateProfile.firstName} ${app.candidate.candidateProfile.lastName}`
                : 'N/A',
            email: app.candidate.email,
            phone: app.candidate.candidateProfile?.phone || undefined,
            location: app.candidate.candidateProfile?.location || undefined,
            experience: app.candidate.candidateProfile?.experience || undefined,
            skills: app.candidate.candidateProfile?.skills || undefined,
            resumeUrl: getPreviewResumeUrl(app.resumeUrl || app.candidate.candidateProfile?.resumeUrl) || undefined,
            status: app.status,
            appliedAt: app.appliedAt,
        }))

        // Apply filters
        const filters: ExportFilters = {
            includePhone,
            includeEmail,
            includeResume,
            includeFull,
        }

        const filteredData = filterApplicantData(applicantsData, filters)

        // Generate file
        let buffer: Buffer
        let contentType: string
        let filename: string

        if (format === 'pdf') {
            buffer = generatePDF(filteredData, job.title)
            contentType = 'application/pdf'
            filename = `applicants-${job.title.replace(/\s+/g, '-')}.pdf`
        } else {
            buffer = generateExcel(filteredData)
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            filename = `applicants-${job.title.replace(/\s+/g, '-')}.xlsx`
        }

        // Return file
        return new NextResponse(buffer as any, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })

    } catch (error) {
        console.error('Export applicants error:', error)
        return NextResponse.json(
            { error: 'Failed to export applicants' },
            { status: 500 }
        )
    }
}

export const GET = requireRole([UserRole.RECRUITER, UserRole.ADMIN])(exportApplicantsHandler)
