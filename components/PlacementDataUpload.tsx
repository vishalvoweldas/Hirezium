'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from 'lucide-react'

export default function PlacementDataUpload() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [clearExisting, setClearExisting] = useState(true)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setMessage(null)
        }
    }

    const handleUpload = async () => {
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file first' })
            return
        }

        setUploading(true)
        setMessage(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('clearExisting', clearExisting.toString())

            const token = localStorage.getItem('token')
            const response = await fetch('/api/analytics/placements/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: `Successfully uploaded ${data.stats.totalRecords} records for ${data.stats.years.length} years and ${data.stats.companies} companies!`
                })
                setFile(null)
                // Reset file input
                const fileInput = document.getElementById('file-upload') as HTMLInputElement
                if (fileInput) fileInput.value = ''
            } else {
                setMessage({ type: 'error', text: data.error || 'Upload failed' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload file. Please try again.' })
        } finally {
            setUploading(false)
        }
    }

    const downloadTemplate = () => {
        // Create sample Excel template
        const csvContent = `Year,Company Name,Placed Count
2023,Google,85
2023,Microsoft,72
2023,Amazon,68
2024,Google,112
2024,Microsoft,98
2024,Amazon,89`

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'placement_data_template.csv'
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <Card className="card-modern">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    Upload Placement Data
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">File Format Requirements:</h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Excel file (.xlsx or .xls)</li>
                        <li>Required columns: <strong>Year</strong>, <strong>Company Name</strong>, <strong>Placed Count</strong></li>
                        <li>One row per company per year</li>
                    </ul>
                    <Button
                        variant="link"
                        onClick={downloadTemplate}
                        className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700"
                    >
                        <Download className="w-4 h-4 mr-1" />
                        Download Template (CSV)
                    </Button>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                    <Label htmlFor="file-upload">Select Excel File</Label>
                    <Input
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    {file && (
                        <p className="text-sm text-gray-600">
                            Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                        </p>
                    )}
                </div>

                {/* Clear Existing Option */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="clear-existing"
                        checked={clearExisting}
                        onChange={(e) => setClearExisting(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                    />
                    <Label htmlFor="clear-existing" className="cursor-pointer">
                        Clear existing data before upload
                    </Label>
                </div>

                {/* Upload Button */}
                <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full gradient-primary text-white"
                >
                    {uploading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Placement Data
                        </>
                    )}
                </Button>

                {/* Message */}
                {message && (
                    <div className={`flex items-start gap-2 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'
                            }`}>
                            {message.text}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
