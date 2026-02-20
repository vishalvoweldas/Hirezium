import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware'
import { profileUpdateSchema } from '@/lib/validation'
import { UserRole } from '@prisma/client'
import { calculateProfileCompletion } from '@/lib/utils'

async function updateProfileHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json()
        const validatedData = profileUpdateSchema.parse(body)
        const userId = request.user!.userId
        const role = request.user!.role

        if (role === UserRole.CANDIDATE) {
            // Find existing profile
            const existingProfile = await prisma.candidateProfile.findUnique({
                where: { userId },
            })

            if (!existingProfile) {
                return NextResponse.json(
                    { error: 'Profile not found' },
                    { status: 404 }
                )
            }

            // Update profile
            const profile = await prisma.candidateProfile.update({
                where: { userId },
                data: {
                    firstName: validatedData.firstName,
                    lastName: validatedData.lastName,
                    phone: validatedData.phone,
                    location: validatedData.location,
                    experience: validatedData.experience,
                    skills: validatedData.skills,
                    bio: validatedData.bio,
                    resumeUrl: validatedData.resumeUrl,
                    resumePublicId: validatedData.resumePublicId,
                    currentCompany: validatedData.currentCompany,
                    currentRole: validatedData.currentRole,
                    noticePeriod: validatedData.noticePeriod,
                    currentCtc: validatedData.currentCtc,
                    expectedCtc: validatedData.expectedCtc,
                },
            })

            // Update profile completion
            const completion = calculateProfileCompletion(profile)
            const updatedProfile = await prisma.candidateProfile.update({
                where: { id: profile.id },
                data: { profileCompletion: completion },
            })

            return NextResponse.json({
                message: 'Profile updated successfully',
                profile: updatedProfile,
            })
        } else if (role === UserRole.RECRUITER) {
            // Find existing profile
            const existingProfile = await prisma.recruiterProfile.findUnique({
                where: { userId },
            })

            if (!existingProfile) {
                return NextResponse.json(
                    { error: 'Profile not found' },
                    { status: 404 }
                )
            }

            // Update profile
            const profile = await prisma.recruiterProfile.update({
                where: { userId },
                data: {
                    companyName: validatedData.firstName + ' ' + (validatedData.lastName || ''),
                    phone: validatedData.phone,
                    location: validatedData.location,
                },
            })

            return NextResponse.json({
                message: 'Profile updated successfully',
                profile,
            })
        }

        return NextResponse.json(
            { error: 'Invalid user role' },
            { status: 400 }
        )
    } catch (error: any) {
        console.error('Profile update error:', error)
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        )
    }
}

export const PUT = requireAuth(updateProfileHandler)
