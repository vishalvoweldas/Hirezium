import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearPlacementData() {
    console.log('🗑️  Clearing all placement analytics data...')

    try {
        // Delete all company placement stats
        const deletedCompanyStats = await prisma.companyPlacementStats.deleteMany({})
        console.log(`✅ Deleted ${deletedCompanyStats.count} company placement records`)

        // Delete all yearly placement stats
        const deletedYearlyStats = await prisma.placementStats.deleteMany({})
        console.log(`✅ Deleted ${deletedYearlyStats.count} yearly placement records`)

        console.log('\n🎉 All placement analytics data cleared successfully!')
    } catch (error) {
        console.error('❌ Error clearing placement data:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

clearPlacementData()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
