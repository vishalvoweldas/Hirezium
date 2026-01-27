import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
        }

        // Hash the incoming token to compare with the one in DB
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')

        // Find user with valid token and not expired
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpiresAt: {
                    gt: new Date()
                }
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid or expired password reset token' },
                { status: 400 }
            )
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Update user password and clear reset fields
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpiresAt: null
            }
        })

        return NextResponse.json({
            message: 'Password has been reset successfully. You can now login with your new password.'
        })

    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json(
            { error: 'Failed to reset password' },
            { status: 500 }
        )
    }
}
