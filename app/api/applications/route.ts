import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, requireAuth, AuthenticatedRequest } from '@/lib/middleware'
import { applicationSchema } from '@/lib/validation'
import { UserRole, ApplicationStatus } from '@prisma/client'

// GET /api/applications - List applications (role-based)
async function getApplicationsHandler(request: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const jobId = searchParams.get('jobId')
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        const where: any = {}

        // Role-based filtering
        if (request.user!.role === UserRole.CANDIDATE) {
            where.candidateId = request.user!.userId
        } else if (request.user!.role === UserRole.RECRUITER) {
            where.job = {
                recruiterId: request.user!.userId,
            }
        }

        if (jobId) where.jobId = jobId
        if (status) where.status = status as ApplicationStatus

        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where,
                select: {
                    id: true,
                    status: true,
                    currentStage: true,
                    appliedAt: true,
                    job: {
                        select: {
                            id: true,
                            title: true,
                            location: true,
                            jobType: true,
                            recruiter: {
                                select: {
                                    recruiterProfile: {
                                        select: {
                                            companyName: true,
                                        }
                                    }
                                }
                            }
                        }
                    },
                    candidate: {
                        select: {
                            id: true,
                            email: true,
                            candidateProfile: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    phone: true,
                                    location: true,
                                }
                            }
                        }
                    }
                },
                orderBy: { appliedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.application.count({ where }),
        ])

        return NextResponse.json({
            applications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        })
    } catch (error) {
        console.error('Get applications error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch applications' },
            { status: 500 }
        )
    }
}

// POST /api/applications - Apply to job (Candidate only)
async function createApplicationHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = applicationSchema.parse(body)

        // Parallelize job existence check and duplicate application check
        const [job, existingApplication] = await Promise.all([
            prisma.job.findUnique({
                where: { id: validatedData.jobId },
                select: { id: true, isActive: true, title: true, recruiter: { select: { recruiterProfile: { select: { companyName: true } } } } }
            }),
            prisma.application.findUnique({
                where: {
                    jobId_candidateId: {
                        jobId: validatedData.jobId,
                        candidateId: request.user!.userId,
                    },
                },
                select: { id: true }
            })
        ])

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        if (!job.isActive) {
            return NextResponse.json(
                { error: 'This job is no longer accepting applications' },
                { status: 400 }
            )
        }

        if (existingApplication) {
            return NextResponse.json(
                { error: 'You have already applied to this job' },
                { status: 400 }
            )
        }

        // Get candidate's resume from profile if not provided
        let resumeUrl = validatedData.resumeUrl
        let resumePublicId = validatedData.resumePublicId

        if (!resumeUrl || !resumePublicId) {
            const profile = await prisma.candidateProfile.findUnique({
                where: { userId: request.user!.userId },
                select: { resumeUrl: true, resumePublicId: true, firstName: true, lastName: true }
            })
            if (!resumeUrl) resumeUrl = profile?.resumeUrl || undefined
            if (!resumePublicId) resumePublicId = profile?.resumePublicId || undefined
        }

        // Create application
        const application = await prisma.application.create({
            data: {
                jobId: validatedData.jobId,
                candidateId: request.user!.userId,
                coverLetter: validatedData.coverLetter,
                resumeUrl,
                resumePublicId,
                status: ApplicationStatus.NEW,
            },
            select: {
                id: true,
                status: true,
                appliedAt: true,
                candidate: {
                    select: {
                        email: true,
                        candidateProfile: {
                            select: { firstName: true, lastName: true }
                        }
                    }
                }
            }
        })

        // Send application received email
        try {
            const { sendApplicationReceivedEmail } = await import('@/lib/email')
            const candidateName = application.candidate.candidateProfile
                ? `${application.candidate.candidateProfile.firstName} ${application.candidate.candidateProfile.lastName}`
                : 'Candidate'

            await sendApplicationReceivedEmail(
                application.candidate.email,
                candidateName,
                job.title,
                job.recruiter.recruiterProfile?.companyName || 'the company'
            )
        } catch (emailError) {
            console.error('Failed to send application received email:', emailError)
        }

        return NextResponse.json(
            {
                message: 'Application submitted successfully',
                application,
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Create application error:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to submit application' },
            { status: 500 }
        )
    }
}

export const GET = requireAuth(getApplicationsHandler)
export const POST = requireRole([UserRole.CANDIDATE])(createApplicationHandler)
