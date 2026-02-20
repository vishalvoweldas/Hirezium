
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { UserRole } from '@prisma/client'

// GET: Fetch recruiter profile
async function getHandler(request: AuthenticatedRequest) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: request.user!.userId },
            include: {
                recruiterProfile: true,
            },
        })

        if (!user || user.role !== UserRole.RECRUITER) {
            return NextResponse.json(
                { error: 'Recruiter profile not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                ...user.recruiterProfile,
            },
        })
    } catch (error) {
        console.error('Get recruiter profile error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        )
    }
}

// PUT: Update recruiter profile
async function putHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json()
        const {
            email,
            password,
            companyName,
            companyWebsite,
            phone,
            location,
            designation,
        } = body

        const userId = request.user!.userId

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { recruiterProfile: true },
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Prepare update data
        const userData: any = {}
        const profileData: any = {}

        // Handle email update
        if (email && email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email },
            })
            if (emailExists) {
                return NextResponse.json(
                    { error: 'Email already in use' },
                    { status: 400 }
                )
            }
            userData.email = email
        }

        // Handle password update
        if (password) {
            userData.password = await hashPassword(password)
        }

        // Handle profile updates
        if (companyName) profileData.companyName = companyName
        if (companyWebsite !== undefined) profileData.companyWebsite = companyWebsite
        if (phone) profileData.phone = phone
        if (location) profileData.location = location
        if (designation) profileData.designation = designation

        // Perform update
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...userData,
                recruiterProfile: {
                    update: profileData,
                },
            },
            include: {
                recruiterProfile: true,
            },
        })

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
                ...updatedUser.recruiterProfile,
            },
        })

    } catch (error) {
        console.error('Update recruiter profile error:', error)
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        )
    }
}

export const GET = requireAuth(getHandler)
export const PUT = requireAuth(putHandler)
