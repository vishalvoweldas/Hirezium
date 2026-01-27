import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'
import { ApprovalStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = loginSchema.parse(body)

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
            include: {
                candidateProfile: true,
                recruiterProfile: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Verify password
        const isValidPassword = await comparePassword(
            validatedData.password,
            user.password
        )

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Check approval status for recruiters
        if (user.role === 'RECRUITER' && user.approvalStatus !== ApprovalStatus.APPROVED) {
            return NextResponse.json(
                {
                    error: 'Your account is pending approval',
                    status: user.approvalStatus,
                },
                { status: 403 }
            )
        }

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        })

        // Prepare user data
        const userData = {
            id: user.id,
            email: user.email,
            role: user.role,
            approvalStatus: user.approvalStatus,
            profile: user.candidateProfile || user.recruiterProfile,
        }

        // Create response with token in cookie
        const response = NextResponse.json(
            {
                message: 'Login successful',
                user: userData,
                token,
            },
            { status: 200 }
        )

        // Set HTTP-only cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        })

        return response
    } catch (error: any) {
        console.error('Login error:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        )
    }
}
