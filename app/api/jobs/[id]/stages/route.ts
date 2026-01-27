import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole } from '@prisma/client'

// GET /api/jobs/[id]/stages - Get stage breakdown for job
async function getStagesHandler(
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Get job with applications
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                applications: {
                    select: {
                        currentStage: true,
                        status: true,
                    },
                },
            },
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
                { error: 'Forbidden - You can only view stages for your jobs' },
                { status: 403 }
            )
        }

        // Calculate stage breakdown
        const stageBreakdown: Record<number, number> = {}
        let rejectedCount = 0
        let selectedCount = 0

        for (let i = 1; i <= job.stages; i++) {
            stageBreakdown[i] = 0
        }

        job.applications.forEach(app => {
            if (app.status === 'REJECTED') {
                rejectedCount++
            } else if (app.status === 'SELECTED') {
                selectedCount++
            } else if (app.currentStage <= job.stages) {
                stageBreakdown[app.currentStage] = (stageBreakdown[app.currentStage] || 0) + 1
            }
        })

        return NextResponse.json({
            jobId: job.id,
            totalStages: job.stages,
            stageBreakdown,
            rejectedCount,
            selectedCount,
            totalApplications: job.applications.length,
        })
    } catch (error) {
        console.error('Get stages error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stage information' },
            { status: 500 }
        )
    }
}

// PUT /api/jobs/[id]/stages - Update number of stages for job
async function updateStagesHandler(
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { stages } = body

        if (!stages || stages < 1 || stages > 10) {
            return NextResponse.json(
                { error: 'Stages must be between 1 and 10' },
                { status: 400 }
            )
        }

        // Get job with applications
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                applications: {
                    select: {
                        currentStage: true,
                    },
                },
            },
        })

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        // Check permissions
        if (
            job.recruiterId !== request.user!.userId &&
            request.user!.role !== UserRole.ADMIN
        ) {
            return NextResponse.json(
                { error: 'Forbidden - You can only update your own jobs' },
                { status: 403 }
            )
        }

        // Check if any application is beyond the new stage count
        const maxCurrentStage = Math.max(...job.applications.map(app => app.currentStage), 0)
        if (stages < maxCurrentStage) {
            return NextResponse.json(
                { error: `Cannot reduce stages below ${maxCurrentStage} as some candidates are already at that stage` },
                { status: 400 }
            )
        }

        // Update job
        const updatedJob = await prisma.job.update({
            where: { id },
            data: { stages },
        })

        return NextResponse.json({
            message: 'Stages updated successfully',
            job: updatedJob,
        })
    } catch (error) {
        console.error('Update stages error:', error)
        return NextResponse.json(
            { error: 'Failed to update stages' },
            { status: 500 }
        )
    }
}

export const GET = requireRole([UserRole.RECRUITER, UserRole.ADMIN])(getStagesHandler)
export const PUT = requireRole([UserRole.RECRUITER, UserRole.ADMIN])(updateStagesHandler)
