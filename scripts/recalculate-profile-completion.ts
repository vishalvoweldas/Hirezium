import { PrismaClient } from '@prisma/client'
import { calculateProfileCompletion } from '../lib/utils'

const prisma = new PrismaClient()

async function recalculateProfileCompletion() {
    try {
        console.log('🔄 Recalculating profile completion for all candidates...\n')

        const candidates = await prisma.candidateProfile.findMany()

        for (const profile of candidates) {
            const completion = calculateProfileCompletion(profile)

            await prisma.candidateProfile.update({
                where: { id: profile.id },
                data: { profileCompletion: completion }
            })

            console.log(`✅ Updated profile for user ${profile.userId}:`)
            console.log(`   - Name: ${profile.firstName} ${profile.lastName}`)
            console.log(`   - Completion: ${completion}%`)
            console.log(`   - Has resume: ${!!profile.resumeUrl}`)
            console.log(`   - Skills: ${profile.skills?.length || 0}`)
            console.log('')
        }

        console.log(`\n🎉 Successfully updated ${candidates.length} candidate profile(s)!`)
    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

recalculateProfileCompletion()
