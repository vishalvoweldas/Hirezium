import { NextRequest, NextResponse } from 'next/server'
import { generateSignedUrl } from '@/lib/cloudinary'
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware'

async function handler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')
    if (!publicId) {
      return NextResponse.json({ error: 'publicId is required' }, { status: 400 })
    }
    // Generate signed URL following the user's strict parameters
    const signedUrl = generateSignedUrl(publicId)
    return NextResponse.json({ signedUrl })
  } catch (error) {
    console.error('Signing error:', error)
    return NextResponse.json({ error: 'Failed to sign URL' }, { status: 500 })
  }
}

export const GET = requireAuth(handler)