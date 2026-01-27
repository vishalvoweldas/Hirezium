import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { recruiterRegisterSchema } from '@/lib/validation'
import { ApprovalStatus, UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = recruiterRegisterSchema.parse(body)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(validatedData.password)

        // Create user with recruiter profile (PENDING approval)
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                role: UserRole.RECRUITER,
                approvalStatus: ApprovalStatus.PENDING,
                recruiterProfile: {
                    create: {
                        companyName: validatedData.companyName,
                        companyWebsite: validatedData.companyWebsite || null,
                        phone: validatedData.phone,
                        location: validatedData.location,
                        designation: validatedData.designation,
                    },
                },
            },
            include: {
                recruiterProfile: true,
            },
        })

        return NextResponse.json(
            {
                message: 'Registration submitted successfully. Your account is pending admin approval.',
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    approvalStatus: user.approvalStatus,
                },
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Recruiter registration error:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to register' },
            { status: 500 }
        )
    }
}
