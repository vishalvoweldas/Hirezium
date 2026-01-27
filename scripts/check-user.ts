    import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'ssiddhartha0120@gmail.com' }
        })

        if (user) {
            console.log('✅ User found!')
            console.log('Email:', user.email)
            console.log('Role:', user.role)
            console.log('Has password:', !!user.password)
            console.log('Password hash (first 20 chars):', user.password?.substring(0, 20))
        } else {
            console.log('❌ User NOT found in database')
            console.log('Please create the user first using the signup page')
        }
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkUser()
