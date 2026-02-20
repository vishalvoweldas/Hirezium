import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface ApplicantData {
    name: string
    email: string
    phone?: string
    location?: string
    experience?: number
    skills?: string[]
    currentCompany?: string
    currentRole?: string
    resumeUrl?: string
    status: string
    appliedAt: Date
}

export interface ExportFilters {
    includePhone: boolean
    includeEmail: boolean
    includeResume: boolean
    includeFull: boolean
}

export function filterApplicantData(
    applicants: ApplicantData[],
    filters: ExportFilters
): any[] {
    return applicants.map(applicant => {
        if (filters.includeFull) {
            return {
                Name: applicant.name,
                Email: applicant.email,
                Phone: applicant.phone || 'N/A',
                Location: applicant.location || 'N/A',
                Experience: applicant.experience ? `${applicant.experience} years` : 'N/A',
                'Current Role': applicant.currentRole || 'N/A',
                'Current Company': applicant.currentCompany || 'N/A',
                Skills: applicant.skills?.join(', ') || 'N/A',
                'Resume URL': applicant.resumeUrl || 'N/A',
                Status: applicant.status,
                'Applied At': new Date(applicant.appliedAt).toLocaleString(),
            }
        }

        const filtered: any = {}

        if (filters.includeEmail) {
            filtered.Email = applicant.email
        }

        if (filters.includePhone) {
            filtered.Phone = applicant.phone || 'N/A'
        }

        if (filters.includeResume) {
            filtered['Resume URL'] = applicant.resumeUrl || 'N/A'
        }

        // Always include name for context
        return { Name: applicant.name, ...filtered }
    })
}

export function generateExcel(data: any[]): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applicants')

    // Set column widths
    const maxWidth = 50
    const wscols = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }))
    worksheet['!cols'] = wscols

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    return buffer
}

export function generatePDF(data: any[], jobTitle: string): Buffer {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text(`Applicants for: ${jobTitle}`, 14, 20)

    // Add generation date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28)

    // Prepare table data
    const headers = Object.keys(data[0] || {})
    const rows = data.map(item => headers.map(header => item[header]))

    // Add table
    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [18, 74, 89] }, // Primary color
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 35 },
    })

    return Buffer.from(doc.output('arraybuffer'))
}
