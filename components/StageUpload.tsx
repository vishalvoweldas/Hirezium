'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface StageUploadProps {
    jobId: string
    currentStage: number
    totalStages: number
    onUploadComplete?: () => void
}

export default function StageUpload({ jobId, currentStage, totalStages, onUploadComplete }: StageUploadProps) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState<{
        progressed: number
        rejected: number
        errors?: string[]
    } | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            const extension = selectedFile.name.toLowerCase().split('.').pop()
            if (extension === 'xlsx' || extension === 'xls') {
                setFile(selectedFile)
                setError(null)
                setResult(null)
            } else {
                setError('Please upload a .xlsx file (PDF support coming soon)')
                setFile(null)
            }
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        setError(null)
        setResult(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('currentStage', currentStage.toString())

            const token = localStorage.getItem('token')
            const res = await fetch(`/api/jobs/${jobId}/stages/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            const data = await res.json()

            if (res.ok) {
                setResult(data.summary)
                setFile(null)
                if (onUploadComplete) {
                    onUploadComplete()
                }
            } else {
                setError(data.error || 'Failed to upload file')
            }
        } catch (err) {
            setError('Failed to upload file. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload Stage {currentStage} Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="file-upload" className="block mb-2">
                        Upload Excel file with candidate emails
                    </Label>
                    <div className="flex items-center gap-4">
                        <label
                            htmlFor="file-upload"
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                        >
                            <Upload className="w-4 h-4" />
                            Choose File
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {file && (
                            <span className="flex items-center gap-2 text-sm text-gray-600">
                                <FileText className="w-4 h-4" />
                                {file.name}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Candidates listed in the file will progress to Stage {currentStage + 1}.
                        Others will be automatically rejected.
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                        <XCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                {result && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            <span>Upload completed successfully!</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
                            <div>
                                <p className="text-sm text-gray-600">Progressed to next stage</p>
                                <p className="text-2xl font-bold text-green-600">{result.progressed}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-red-600">{result.rejected}</p>
                            </div>
                        </div>
                        {result.errors && result.errors.length > 0 && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-sm font-semibold text-yellow-800 mb-1">Errors:</p>
                                <ul className="text-sm text-yellow-700 list-disc list-inside">
                                    {result.errors.map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload and Update Stages
                        </>
                    )}
                </Button>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-semibold text-blue-800 mb-2">Excel File Format:</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• First column should contain candidate email addresses</li>
                        <li>• One email per row</li>
                        <li>• Header row is optional</li>
                        <li>• Only valid email addresses will be processed</li>
                        <li className="text-xs italic">• PDF support coming soon</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
