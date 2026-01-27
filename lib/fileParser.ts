import * as XLSX from 'xlsx'

/**
 * Extract email addresses from Excel file buffer
 */
export async function parseExcelFile(buffer: Buffer): Promise<string[]> {
    try {
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        const emails: string[] = []
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        // Extract emails from first column (skip header if present)
        for (let i = 0; i < data.length; i++) {
            const row = data[i]
            if (row && row.length > 0) {
                const cellValue = String(row[0]).trim()

                // Validate email format
                if (emailRegex.test(cellValue)) {
                    emails.push(cellValue.toLowerCase())
                }
            }
        }

        // Remove duplicates
        return [...new Set(emails)]
    } catch (error) {
        console.error('Error parsing Excel file:', error)
        throw new Error('Failed to parse Excel file. Please ensure it is a valid .xlsx file.')
    }
}

/**
 * Extract email addresses from PDF file buffer
 * Note: PDF support temporarily disabled due to Next.js compatibility issues
 */
export async function parsePDFFile(buffer: Buffer): Promise<string[]> {
    throw new Error('PDF parsing is currently not supported. Please use Excel (.xlsx) files instead.')
}

/**
 * Parse uploaded file and extract candidate emails
 * Currently supports Excel (.xlsx) format only
 */
export async function parseUploadedFile(
    buffer: Buffer,
    filename: string
): Promise<string[]> {
    const extension = filename.toLowerCase().split('.').pop()

    if (extension === 'xlsx' || extension === 'xls') {
        return parseExcelFile(buffer)
    } else if (extension === 'pdf') {
        throw new Error('PDF support is temporarily disabled. Please use Excel (.xlsx) files.')
    } else {
        throw new Error('Unsupported file format. Please upload .xlsx files only.')
    }
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}
