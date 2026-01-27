import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'saketh1805@gmail.com'
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            candidateProfile: true
        }
    })

    if (!user) {
        console.log('User not found')
        return
    }

    console.log('User found:', user.email)
    console.log('Candidate Profile:', user.candidateProfile)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
