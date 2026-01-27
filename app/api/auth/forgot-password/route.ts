import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        // Security: Do not reveal if email exists
        if (!user) {
            return NextResponse.json({
                message: 'If an account exists for this email, a password reset link has been sent.'
            })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex')

        // Set expiration (30 minutes)
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

        // Save hashed token to DB
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpiresAt: expiresAt
            }
        })

        // Send email with plain token
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const resetLink = `${appUrl}/auth/reset-password?token=${resetToken}`

        await sendPasswordResetEmail(email, resetLink)

        return NextResponse.json({
            message: 'If an account exists for this email, a password reset link has been sent.'
        })

    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}
