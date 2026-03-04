import { NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

async function deleteAccountHandler(request: AuthenticatedRequest) {
    try {
        const userId = request.user!.userId

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Delete user - all related records (profile, applications, saved jobs)
        // will be cascade deleted due to onDelete: Cascade in the schema
        await prisma.user.delete({
            where: { id: userId },
        })

        return NextResponse.json({
            message: 'Account deleted successfully',
        })
    } catch (error) {
        console.error('Delete account error:', error)
        return NextResponse.json(
            { error: 'Failed to delete account' },
            { status: 500 }
        )
    }
}

export const DELETE = requireAuth(deleteAccountHandler)
