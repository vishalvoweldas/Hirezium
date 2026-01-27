import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole } from '@prisma/client'

// GET /api/saved-jobs - List saved jobs (Candidate)
async function getSavedJobsHandler(request: AuthenticatedRequest) {
    try {
        const savedJobs = await prisma.savedJob.findMany({
            where: { candidateId: request.user!.userId },
            include: {
                job: {
                    include: {
                        recruiter: {
                            include: {
                                recruiterProfile: true,
                            },
                        },
                        _count: {
                            select: { applications: true },
                        },
                    },
                },
            },
            orderBy: { savedAt: 'desc' },
        })

        return NextResponse.json({
            savedJobs: savedJobs.map(saved => ({
                id: saved.id,
                savedAt: saved.savedAt,
                job: {
                    ...saved.job,
                    companyName: saved.job.recruiter.recruiterProfile?.companyName,
                    applicantCount: saved.job._count.applications,
                },
            })),
        })
    } catch (error) {
        console.error('Get saved jobs error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch saved jobs' },
            { status: 500 }
        )
    }
}

// POST /api/saved-jobs - Save job (Candidate)
async function saveJobHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json()
        const { jobId } = body

        if (!jobId) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            )
        }

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

        // Check if already saved
        const existing = await prisma.savedJob.findUnique({
            where: {
                jobId_candidateId: {
                    jobId,
                    candidateId: request.user!.userId,
                },
            },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Job already saved' },
                { status: 400 }
            )
        }

        // Save job
        const savedJob = await prisma.savedJob.create({
            data: {
                jobId,
                candidateId: request.user!.userId,
            },
        })

        return NextResponse.json(
            {
                message: 'Job saved successfully',
                savedJob,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Save job error:', error)
        return NextResponse.json(
            { error: 'Failed to save job' },
            { status: 500 }
        )
    }
}

// DELETE /api/saved-jobs - Unsave job (Candidate)
async function unsaveJobHandler(request: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const jobId = searchParams.get('jobId')

        if (!jobId) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            )
        }

        // Delete saved job
        await prisma.savedJob.delete({
            where: {
                jobId_candidateId: {
                    jobId,
                    candidateId: request.user!.userId,
                },
            },
        })

        return NextResponse.json({
            message: 'Job unsaved successfully',
        })
    } catch (error) {
        console.error('Unsave job error:', error)
        return NextResponse.json(
            { error: 'Failed to unsave job' },
            { status: 500 }
        )
    }
}

export const GET = requireRole([UserRole.CANDIDATE])(getSavedJobsHandler)
export const POST = requireRole([UserRole.CANDIDATE])(saveJobHandler)
export const DELETE = requireRole([UserRole.CANDIDATE])(unsaveJobHandler)
