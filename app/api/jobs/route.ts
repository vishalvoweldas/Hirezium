import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, requireAuth, AuthenticatedRequest } from '@/lib/middleware'
import { jobSchema } from '@/lib/validation'
import { UserRole } from '@prisma/client'

// GET /api/jobs - List jobs with filters (public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        const keyword = searchParams.get('keyword') || ''
        const location = searchParams.get('location') || ''
        const jobType = searchParams.get('jobType') || ''
        const experience = searchParams.get('experience') || ''
        const isRemote = searchParams.get('isRemote') === 'true'
        const workMode = searchParams.get('workMode') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        const skip = (page - 1) * limit

        // Build filter conditions
        const where: any = {
            isActive: true,
        }

        if (keyword) {
            where.OR = [
                { title: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
            ]
        }

        if (location) {
            where.location = { contains: location, mode: 'insensitive' }
        }

        if (jobType) {
            where.jobType = jobType
        }

        if (experience) {
            where.experience = { contains: experience, mode: 'insensitive' }
        }

        if (isRemote) {
            where.workMode = 'REMOTE'
        }

        if (workMode) {
            where.workMode = workMode
        }

        // Fetch jobs
        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
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
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.job.count({ where }),
        ])

        return NextResponse.json({
            jobs: jobs.map(job => ({
                ...job,
                applicantCount: job._count.applications,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Get jobs error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch jobs' },
            { status: 500 }
        )
    }
}

// POST /api/jobs - Create job (Recruiter/Admin only)
async function createJobHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = jobSchema.parse(body)

        // Convert deadline string to Date object if provided
        const jobData: any = {
            ...validatedData,
            recruiterId: request.user!.userId,
        }

        // Handle deadline conversion
        if (validatedData.deadline && validatedData.deadline.trim() !== '') {
            jobData.deadline = new Date(validatedData.deadline)
        } else {
            delete jobData.deadline // Remove if empty
        }

        // Create job
        const job = await prisma.job.create({
            data: jobData,
            include: {
                recruiter: {
                    include: {
                        recruiterProfile: true,
                    },
                },
            },
        })

        return NextResponse.json(
            {
                message: 'Job created successfully',
                job,
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Create job error:', error)
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
        })

        if (error.name === 'ZodError') {
            console.error('Zod validation errors:', error.errors)
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            )
        }

        // Return more detailed error for debugging
        return NextResponse.json(
            {
                error: 'Failed to create job',
                details: error.message,
                name: error.name,
            },
            { status: 500 }
        )
    }
}

export const POST = requireRole([UserRole.RECRUITER, UserRole.ADMIN])(createJobHandler)
