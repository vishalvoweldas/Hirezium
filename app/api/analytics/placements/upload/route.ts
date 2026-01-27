import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, AuthenticatedRequest } from '@/lib/middleware'
import { UserRole } from '@prisma/client'
import * as XLSX from 'xlsx'

interface PlacementRecord {
    year: number
    companyName: string
    placedCount: number
}

async function uploadPlacementDataHandler(request: AuthenticatedRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate file type
        const fileName = file.name.toLowerCase()
        if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
            return NextResponse.json(
                { error: 'Invalid file type. Only Excel files (.xlsx, .xls) are allowed.' },
                { status: 400 }
            )
        }

        // Read file
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Parse Excel file
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet) as any[]

        if (data.length === 0) {
            return NextResponse.json(
                { error: 'Excel file is empty' },
                { status: 400 }
            )
        }

        // Validate and parse data
        const placementRecords: PlacementRecord[] = []
        const yearlyTotals = new Map<number, number>()

        for (let i = 0; i < data.length; i++) {
            const row = data[i]

            // Expected columns: Year, Company Name, Placed Count
            const year = parseInt(row['Year'] || row['year'])
            const companyName = (row['Company Name'] || row['company_name'] || row['CompanyName'] || row['Company'])?.toString().trim()
            const placedCount = parseInt(row['Placed Count'] || row['placed_count'] || row['PlacedCount'] || row['Count'])

            if (!year || !companyName || isNaN(placedCount)) {
                return NextResponse.json(
                    {
                        error: `Invalid data at row ${i + 2}. Expected columns: Year, Company Name, Placed Count`,
                        row: row
                    },
                    { status: 400 }
                )
            }

            placementRecords.push({ year, companyName, placedCount })
            yearlyTotals.set(year, (yearlyTotals.get(year) || 0) + placedCount)
        }

        // Clear existing data (optional - can be made configurable)
        const clearExisting = formData.get('clearExisting') === 'true'
        if (clearExisting) {
            await prisma.companyPlacementStats.deleteMany({})
            await prisma.placementStats.deleteMany({})
        }

        // Insert yearly stats
        for (const [year, totalPlaced] of yearlyTotals.entries()) {
            await prisma.placementStats.upsert({
                where: { year },
                update: { totalPlaced },
                create: { year, totalPlaced }
            })
        }

        // Insert company stats
        for (const record of placementRecords) {
            await prisma.companyPlacementStats.upsert({
                where: {
                    companyName_year: {
                        companyName: record.companyName,
                        year: record.year
                    }
                },
                update: { placedCount: record.placedCount },
                create: {
                    companyName: record.companyName,
                    year: record.year,
                    placedCount: record.placedCount
                }
            })
        }

        return NextResponse.json({
            message: 'Placement data uploaded successfully',
            stats: {
                totalRecords: placementRecords.length,
                years: Array.from(yearlyTotals.keys()).sort(),
                companies: [...new Set(placementRecords.map(r => r.companyName))].length
            },
            success: true
        })
    } catch (error) {
        console.error('Upload placement data error:', error)
        return NextResponse.json(
            { error: 'Failed to upload placement data', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

export const POST = requireRole([UserRole.ADMIN, UserRole.RECRUITER])(uploadPlacementDataHandler)
