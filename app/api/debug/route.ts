import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        // Test database connection
        const userCount = await prisma.user.count()

        // Get admin user (without password)
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@hireflow.com' },
            select: {
                id: true,
                email: true,
                role: true,
                approvalStatus: true,
                createdAt: true,
            },
        })

        return NextResponse.json({
            status: 'Database connected',
            totalUsers: userCount,
            adminExists: !!admin,
            adminData: admin,
        })
    } catch (error: any) {
        return NextResponse.json({
            status: 'Database connection failed',
            error: error.message,
        }, { status: 500 })
    }
}
