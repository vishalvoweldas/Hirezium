import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
    return format(new Date(date), 'MMM dd, yyyy')
}

export function formatDateTime(date: Date | string): string {
    return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export function formatRelativeTime(date: Date | string): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        NEW: 'bg-blue-100 text-blue-800 border-blue-200',
        REVIEWED: 'bg-purple-100 text-purple-800 border-purple-200',
        SHORTLISTED: 'bg-green-100 text-green-800 border-green-200',
        REJECTED: 'bg-red-100 text-red-800 border-red-200',
        PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        APPROVED: 'bg-green-100 text-green-800 border-green-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function calculateProfileCompletion(profile: any): number {
    if (!profile) return 0

    const requiredFields = [
        'firstName',
        'lastName',
        'phone',
        'resumeUrl'
    ]

    const optionalFields = [
        'location',
        'experience',
        'skills',
        'bio',
        'currentRole'
    ]

    // Check required fields (must all be filled)
    const requiredFilled = requiredFields.filter(field => {
        const value = profile[field]
        if (Array.isArray(value)) return value.length > 0
        return value !== null && value !== undefined && value !== '' && value !== 0
    })

    // Check optional fields
    const optionalFilled = optionalFields.filter(field => {
        const value = profile[field]
        if (Array.isArray(value)) return value.length > 0
        if (field === 'experience') return value !== null && value !== undefined
        return value !== null && value !== undefined && value !== ''
    })

    // Required fields are worth 60%, optional fields are worth 40%
    const requiredPercentage = (requiredFilled.length / requiredFields.length) * 60
    const optionalPercentage = (optionalFilled.length / optionalFields.length) * 40

    return Math.round(requiredPercentage + optionalPercentage)
}

/**
 * Converts a Cloudinary raw upload URL to an image upload URL for inline browser preview.
 * This is primarily used for the Excel export link generation.
 */
export const getPreviewResumeUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined
    const strUrl = String(url)

    // For PDFs, we now upload as resource_type: 'image'
    // but we still need to handle the conversion for existing 'raw' uploads in the database
    if (strUrl.toLowerCase().includes('.pdf') && strUrl.includes('/raw/upload/')) {
        return strUrl.split(/\/raw\/upload\//i).join('/image/upload/')
    }
    return strUrl
}

/**
 * Generates a stable preview URL for resumes.
 */
export function getResumePreviewUrl(url: string | null | undefined): string | null {
    if (!url) return null

    // If it's a PDF, Cloudinary serves it as an image for preview
    // We ensure the URL uses the /image/upload/ path
    if (url.toLowerCase().includes('.pdf')) {
        return url.replace('/raw/upload/', '/image/upload/')
    }

    // For DOC/DOCX, continue using Google Docs Viewer
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
}
