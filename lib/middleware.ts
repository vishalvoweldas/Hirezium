import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from './auth'
import { UserRole } from '@prisma/client'

export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload
}

export function getTokenFromRequest(request: NextRequest): string | null {
    // Try Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7)
    }

    // Try cookies
    const token = request.cookies.get('token')?.value
    if (token) {
        return token
    }

    return null
}

export function requireAuth(
    handler: (
        request: AuthenticatedRequest,
        context?: any
    ) => Promise<NextResponse>
) {
    return async (request: NextRequest, context?: any) => {
        const token = getTokenFromRequest(request)

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No token provided' },
                { status: 401 }
            )
        }

        const payload = verifyToken(token)
        if (!payload) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid token' },
                { status: 401 }
            )
        }

        const authRequest = request as AuthenticatedRequest
        authRequest.user = payload

        return handler(authRequest, context)
    }
}

export function requireRole(roles: UserRole[]) {
    return (
        handler: (
            request: AuthenticatedRequest,
            context?: any
        ) => Promise<NextResponse>
    ) => {
        return requireAuth(async (request, context) => {
            if (!request.user || !roles.includes(request.user.role)) {
                return NextResponse.json(
                    { error: 'Forbidden - Insufficient permissions' },
                    { status: 403 }
                )
            }

            return handler(request, context)
        })
    }
}
