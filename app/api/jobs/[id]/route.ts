import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, requireAuth, AuthenticatedRequest } from '@/lib/middleware'
import { jobSchema } from '@/lib/validation'
import { UserRole } from '@prisma/client'

// GET /api/jobs/[id] - Get job details (public)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const job = await prisma.job.findUnique({
            where: { id },
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
        })

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            ...job,
            companyName: job.recruiter.recruiterProfile?.companyName,
            applicantCount: job._count.applications,
        })
    } catch (error) {
        console.error('Get job error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch job' },
            { status: 500 }
        )
    }
}

// PUT /api/jobs/[id] - Update job (Owner or Admin)
async function updateJobHandler(
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Check if job exists
        const existingJob = await prisma.job.findUnique({
            where: { id },
        })

        if (!existingJob) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        // Check permissions (owner or admin)
        console.log('Permission check:', {
            jobRecruiterId: existingJob.recruiterId,
            requestUserId: request.user!.userId,
            requestUserRole: request.user!.role,
            match: existingJob.recruiterId === request.user!.userId
        })

        if (
            existingJob.recruiterId !== request.user!.userId &&
            request.user!.role !== UserRole.ADMIN
        ) {
            console.log('Permission denied!')
            return NextResponse.json(
                { error: 'Forbidden - You can only update your own jobs' },
                { status: 403 }
            )
        }

        console.log('Permission granted!')

        // Validate input (partial update allowed)
        const validatedData = jobSchema.partial().parse(body)

        // Convert deadline string to Date object if provided
        const updateData: any = { ...validatedData }

        if (validatedData.deadline !== undefined) {
            if (validatedData.deadline && validatedData.deadline.trim() !== '') {
                updateData.deadline = new Date(validatedData.deadline)
            } else {
                updateData.deadline = null // Set to null if empty
            }
        }

        // Update job
        const job = await prisma.job.update({
            where: { id },
            data: updateData,
            include: {
                recruiter: {
                    include: {
                        recruiterProfile: true,
                    },
                },
            },
        })

        return NextResponse.json({
            message: 'Job updated successfully',
            job,
        })
    } catch (error: any) {
        console.error('Update job error:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to update job' },
            { status: 500 }
        )
    }
}

// DELETE /api/jobs/[id] - Delete job (Owner or Admin)
async function deleteJobHandler(
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        // Check if job exists
        const existingJob = await prisma.job.findUnique({
            where: { id },
        })

        if (!existingJob) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        // Check permissions (owner or admin)
        if (
            existingJob.recruiterId !== request.user!.userId &&
            request.user!.role !== UserRole.ADMIN
        ) {
            return NextResponse.json(
                { error: 'Forbidden - You can only delete your own jobs' },
                { status: 403 }
            )
        }

        // Delete job
        await prisma.job.delete({
            where: { id },
        })

        return NextResponse.json({
            message: 'Job deleted successfully',
        })
    } catch (error) {
        console.error('Delete job error:', error)
        return NextResponse.json(
            { error: 'Failed to delete job' },
            { status: 500 }
        )
    }
}

export const PUT = requireRole([UserRole.RECRUITER, UserRole.ADMIN])(updateJobHandler)
export const DELETE = requireRole([UserRole.RECRUITER, UserRole.ADMIN])(deleteJobHandler)
