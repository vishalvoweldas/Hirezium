import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole } from '@prisma/client'
import { hashPassword, comparePassword } from '@/lib/auth'

// PUT /api/admin/profile/update - Update admin profile (email/password)
async function updateAdminProfileHandler(request: AuthenticatedRequest) {
    try {
        const body = await request.json()
        const { email, currentPassword, newPassword } = body
        const userId = request.user!.userId

        // Find current user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Verify current password
        const isValidPassword = await comparePassword(currentPassword, user.password)
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid current password' },
                { status: 401 }
            )
        }

        const updateData: any = {}

        // Handle email update
        if (email && email !== user.email) {
            // Check if new email is already taken
            const existingUser = await prisma.user.findUnique({
                where: { email },
            })
            if (existingUser) {
                return NextResponse.json(
                    { error: 'Email already in use' },
                    { status: 400 }
                )
            }
            updateData.email = email
        }

        // Handle password update
        if (newPassword) {
            if (newPassword.length < 6) {
                return NextResponse.json(
                    { error: 'New password must be at least 6 characters long' },
                    { status: 400 }
                )
            }
            updateData.password = await hashPassword(newPassword)
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { message: 'No changes provided' },
                { status: 400 }
            )
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        })

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        })

    } catch (error) {
        console.error('Admin profile update error:', error)
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        )
    }
}

export const PUT = requireRole([UserRole.ADMIN])(updateAdminProfileHandler)
