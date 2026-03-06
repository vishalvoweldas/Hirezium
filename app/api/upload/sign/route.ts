import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function handler(request: AuthenticatedRequest) {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000)

        // Match the parameters used in the direct upload
        const paramsToSign = {
            timestamp,
            folder: 'hirezium/resumes',
            resource_type: 'raw',
            type: 'authenticated',
        }

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET!
        )

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
        })
    } catch (error) {
        console.error('Sign upload error:', error)
        return NextResponse.json(
            { error: 'Failed to generate upload signature' },
            { status: 500 }
        )
    }
}

export const GET = requireAuth(handler)
