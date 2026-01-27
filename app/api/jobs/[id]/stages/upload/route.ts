import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole, ApplicationStatus } from '@prisma/client'
import { parseUploadedFile } from '@/lib/fileParser'
import {
    sendStageProgressionEmail,
    sendRejectionEmail,
    sendSelectionEmail,
} from '@/lib/email'

// POST /api/jobs/[id]/stages/upload - Upload Excel/PDF to update candidate stages
async function uploadStageFileHandler(
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params

        // Get job details
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
                { error: 'Forbidden - You can only manage stages for your jobs' },
                { status: 403 }
            )
        }

        // Parse form data
        const formData = await request.formData()
        const file = formData.get('file') as File
        const currentStageStr = formData.get('currentStage') as string

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            )
        }

        if (!currentStageStr) {
            return NextResponse.json(
                { error: 'Current stage is required' },
                { status: 400 }
            )
        }

        const currentStage = parseInt(currentStageStr)

        if (currentStage < 1 || currentStage > job.stages) {
            return NextResponse.json(
                { error: `Current stage must be between 1 and ${job.stages}` },
                { status: 400 }
            )
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Parse file to extract candidate emails
        let passedCandidateEmails: string[]
        try {
            passedCandidateEmails = await parseUploadedFile(buffer, file.name)
        } catch (error: any) {
            return NextResponse.json(
                { error: error.message || 'Failed to parse file' },
                { status: 400 }
            )
        }

        if (passedCandidateEmails.length === 0) {
            return NextResponse.json(
                { error: 'No valid email addresses found in the file' },
                { status: 400 }
            )
        }

        // Get all applications at the current stage for this job
        const applications = await prisma.application.findMany({
            where: {
                jobId,
                currentStage,
                status: {
                    notIn: ['REJECTED', 'SELECTED'],
                },
            },
            include: {
                candidate: {
                    include: {
                        candidateProfile: true,
                    },
                },
            },
        })

        let progressedCount = 0
        let rejectedCount = 0
        const errors: string[] = []

        // Process each application
        for (const application of applications) {
            const candidateEmail = application.candidate.email.toLowerCase()
            const candidateName = application.candidate.candidateProfile
                ? `${application.candidate.candidateProfile.firstName} ${application.candidate.candidateProfile.lastName}`
                : 'Candidate'

            try {
                if (passedCandidateEmails.includes(candidateEmail)) {
                    // Candidate passed - move to next stage
                    const nextStage = currentStage + 1
                    const isLastStage = nextStage > job.stages

                    if (isLastStage) {
                        // Last stage - mark as SELECTED
                        await prisma.$transaction([
                            prisma.application.update({
                                where: { id: application.id },
                                data: {
                                    status: ApplicationStatus.SELECTED,
                                    currentStage: job.stages,
                                },
                            }),
                            prisma.job.update({
                                where: { id: jobId },
                                data: {
                                    selectedCount: {
                                        increment: 1,
                                    },
                                },
                            }),
                        ])

                        // Send selection email
                        await sendSelectionEmail(candidateEmail, candidateName, job.title)
                    } else {
                        // Move to next stage
                        const stageStatus = `STAGE_${nextStage}` as ApplicationStatus
                        await prisma.application.update({
                            where: { id: application.id },
                            data: {
                                status: stageStatus,
                                currentStage: nextStage,
                            },
                        })

                        // Send stage progression email
                        await sendStageProgressionEmail(
                            candidateEmail,
                            candidateName,
                            job.title,
                            nextStage,
                            job.stages
                        )
                    }

                    progressedCount++
                } else {
                    // Candidate not in list - reject
                    await prisma.application.update({
                        where: { id: application.id },
                        data: {
                            status: ApplicationStatus.REJECTED,
                        },
                    })

                    // Send rejection email
                    await sendRejectionEmail(candidateEmail, candidateName, job.title, currentStage)

                    rejectedCount++
                }
            } catch (error: any) {
                console.error(`Error processing application ${application.id}:`, error)
                errors.push(`Failed to process ${candidateEmail}: ${error.message}`)
            }
        }

        return NextResponse.json({
            message: 'Stage update completed successfully',
            summary: {
                totalProcessed: applications.length,
                progressed: progressedCount,
                rejected: rejectedCount,
                errors: errors.length > 0 ? errors : undefined,
            },
        })
    } catch (error) {
        console.error('Upload stage file error:', error)
        return NextResponse.json(
            { error: 'Failed to process stage update' },
            { status: 500 }
        )
    }
}

export const POST = requireRole([UserRole.RECRUITER, UserRole.ADMIN])(uploadStageFileHandler)
