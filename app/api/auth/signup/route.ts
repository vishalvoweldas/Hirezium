import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { signupSchema } from '@/lib/validation'
import { ApprovalStatus, UserRole } from '@prisma/client'
import { calculateProfileCompletion } from '@/lib/utils'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = signupSchema.parse(body)

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

        // Create user with candidate profile
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                role: UserRole.CANDIDATE,
                approvalStatus: ApprovalStatus.APPROVED,
                candidateProfile: {
                    create: {
                        firstName: validatedData.firstName,
                        lastName: validatedData.lastName,
                        phone: validatedData.phone,
                        location: validatedData.location,
                        skills: [],
                        profileCompletion: 0,
                    },
                },
            },
            include: {
                candidateProfile: true,
            },
        })

        // Calculate profile completion
        if (user.candidateProfile) {
            const completion = calculateProfileCompletion(user.candidateProfile)
            await prisma.candidateProfile.update({
                where: { id: user.candidateProfile.id },
                data: { profileCompletion: completion },
            })
        }

        return NextResponse.json(
            {
                message: 'Account created successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Signup error:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        )
    }
}
