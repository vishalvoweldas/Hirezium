import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole, ApplicationStatus } from '@prisma/client'

// PUT /api/applications/[id] - Update application status/notes (Recruiter/Admin)
async function updateApplicationHandler(
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status, notes } = body

        // Check if application exists
        const application = await prisma.application.findUnique({
            where: { id },
            include: { job: true },
        })

        if (!application) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            )
        }

        // Check permissions (job owner or admin)
        if (
            application.job.recruiterId !== request.user!.userId &&
            request.user!.role !== UserRole.ADMIN
        ) {
            return NextResponse.json(
                { error: 'Forbidden - You can only update applications for your jobs' },
                { status: 403 }
            )
        }

        // Track if status changed for email notification
        const statusChanged = status && status !== application.status

        // Update application
        const updatedApplication = await prisma.application.update({
            where: { id },
            data: {
                ...(status && { status: status as ApplicationStatus }),
                ...(notes !== undefined && { notes }),
                // Set selectedAt timestamp when status changes to SELECTED (if not already set)
                ...(status === 'SELECTED' && !application.selectedAt && { selectedAt: new Date() }),
            },
            include: {
                candidate: {
                    include: {
                        candidateProfile: true,
                    },
                },
                job: {
                    include: {
                        recruiter: {
                            include: {
                                recruiterProfile: true,
                            },
                        },
                    },
                },
            },
        })

        // Auto-increment placement stats when status changes to SELECTED
        if (status === 'SELECTED' && application.status !== 'SELECTED' && !application.selectedAt) {
            try {
                const currentYear = new Date().getFullYear()
                const companyName = updatedApplication.job.recruiter.recruiterProfile?.companyName || 'Unknown Company'

                // Increment yearly placement stats
                await prisma.placementStats.upsert({
                    where: { year: currentYear },
                    update: {
                        totalPlaced: {
                            increment: 1,
                        },
                    },
                    create: {
                        year: currentYear,
                        totalPlaced: 1,
                    },
                })

                // Increment company placement stats
                await prisma.companyPlacementStats.upsert({
                    where: {
                        companyName_year: {
                            companyName,
                            year: currentYear,
                        },
                    },
                    update: {
                        placedCount: {
                            increment: 1,
                        },
                    },
                    create: {
                        companyName,
                        year: currentYear,
                        placedCount: 1,
                    },
                })

                // Increment job's selectedCount
                await prisma.job.update({
                    where: { id: application.jobId },
                    data: {
                        selectedCount: {
                            increment: 1,
                        },
                    },
                })

                console.log(`✅ Placement stats updated: ${companyName} - ${currentYear}`)
            } catch (statsError) {
                console.error('Failed to update placement stats:', statsError)
                // Don't fail the application update if stats update fails
            }
        }

        // Send email notification if status changed
        if (statusChanged) {
            try {
                const {
                    sendStageProgressionEmail,
                    sendRejectionEmail,
                    sendSelectionEmail,
                } = await import('@/lib/email')

                const candidateName = updatedApplication.candidate.candidateProfile
                    ? `${updatedApplication.candidate.candidateProfile.firstName} ${updatedApplication.candidate.candidateProfile.lastName}`
                    : 'Candidate'
                const candidateEmail = updatedApplication.candidate.email
                const jobTitle = updatedApplication.job.title

                if (status === 'REJECTED') {
                    await sendRejectionEmail(
                        candidateEmail,
                        candidateName,
                        jobTitle,
                        updatedApplication.currentStage
                    )
                } else if (status === 'SELECTED') {
                    await sendSelectionEmail(candidateEmail, candidateName, jobTitle)
                } else if (status?.startsWith('STAGE_')) {
                    const stageNumber = parseInt(status.replace('STAGE_', ''))
                    await sendStageProgressionEmail(
                        candidateEmail,
                        candidateName,
                        jobTitle,
                        stageNumber,
                        updatedApplication.job.stages
                    )
                }
            } catch (emailError) {
                console.error('Failed to send status update email:', emailError)
                // Don't fail the update if email fails
            }
        }

        return NextResponse.json({
            message: 'Application updated successfully',
            application: updatedApplication,
        })
    } catch (error) {
        console.error('Update application error:', error)
        return NextResponse.json(
            { error: 'Failed to update application' },
            { status: 500 }
        )
    }
}

export const PUT = requireRole([UserRole.RECRUITER, UserRole.ADMIN])(updateApplicationHandler)
