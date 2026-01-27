import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole } from '@prisma/client'

const historicalData = [
    {
        year: 2023,
        totalPlaced: 450,
        companies: [
            { name: 'Google', count: 85 },
            { name: 'Microsoft', count: 72 },
            { name: 'Amazon', count: 68 },
            { name: 'Meta', count: 55 },
            { name: 'Apple', count: 48 },
            { name: 'Netflix', count: 35 },
            { name: 'Tesla', count: 28 },
            { name: 'Others', count: 59 }
        ]
    },
    {
        year: 2024,
        totalPlaced: 620,
        companies: [
            { name: 'Google', count: 112 },
            { name: 'Microsoft', count: 98 },
            { name: 'Amazon', count: 89 },
            { name: 'Meta', count: 76 },
            { name: 'Apple', count: 65 },
            { name: 'Netflix', count: 48 },
            { name: 'Tesla', count: 42 },
            { name: 'Others', count: 90 }
        ]
    }
]

async function seedHandler(request: AuthenticatedRequest) {
    try {
        for (const yearData of historicalData) {
            // Create or update yearly stats
            await prisma.placementStats.upsert({
                where: { year: yearData.year },
                update: { totalPlaced: yearData.totalPlaced },
                create: {
                    year: yearData.year,
                    totalPlaced: yearData.totalPlaced
                }
            })

            // Create or update company stats
            for (const company of yearData.companies) {
                await prisma.companyPlacementStats.upsert({
                    where: {
                        companyName_year: {
                            companyName: company.name,
                            year: yearData.year
                        }
                    },
                    update: { placedCount: company.count },
                    create: {
                        companyName: company.name,
                        year: yearData.year,
                        placedCount: company.count
                    }
                })
            }
        }

        return NextResponse.json({
            message: 'Placement analytics data seeded successfully',
            yearsSeeded: historicalData.map(d => d.year),
            success: true
        })
    } catch (error) {
        console.error('Error seeding placement data:', error)
        return NextResponse.json(
            { error: 'Failed to seed placement data' },
            { status: 500 }
        )
    }
}

export const POST = requireRole([UserRole.ADMIN])(seedHandler)
