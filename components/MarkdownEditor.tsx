
'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bold, Italic, List, Link as LinkIcon, Heading, ListOrdered } from 'lucide-react'

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    label?: string
    placeholder?: string
    required?: boolean
    id?: string
    rows?: number
}

export default function MarkdownEditor({
    value,
    onChange,
    label,
    placeholder,
    required = false,
    id,
    rows = 6
}: MarkdownEditorProps) {
    const [activeTab, setActiveTab] = useState('write')

    const insertFormat = (format: string) => {
        const textarea = document.getElementById(id || 'markdown-editor') as HTMLTextAreaElement
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = value
        let newText = ''
        let newCursorPos = 0

        switch (format) {
            case 'bold':
                newText = text.substring(0, start) + '**' + text.substring(start, end) + '**' + text.substring(end)
                newCursorPos = end + 2
                break
            case 'italic':
                newText = text.substring(0, start) + '*' + text.substring(start, end) + '*' + text.substring(end)
                newCursorPos = end + 1
                break
            case 'list':
                newText = text.substring(0, start) + '\n- ' + text.substring(start, end) + text.substring(end)
                newCursorPos = end + 3
                break
            case 'ordered-list':
                newText = text.substring(0, start) + '\n1. ' + text.substring(start, end) + text.substring(end)
                newCursorPos = end + 4
                break
            case 'link':
                newText = text.substring(0, start) + '[' + (text.substring(start, end) || 'text') + '](url)' + text.substring(end)
                newCursorPos = end + 1
                break
            case 'heading':
                newText = text.substring(0, start) + '### ' + text.substring(start, end) + text.substring(end)
                newCursorPos = end + 4
                break
            default:
                return
        }

        onChange(newText)

        // Restore focus and cursor position after render
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
    }

    return (
        <div className="space-y-2">
            {label && (
                <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="border rounded-md">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center justify-between px-2 py-2 border-b bg-gray-50">
                        <TabsList className="h-9">
                            <TabsTrigger value="write" className="text-xs">Write</TabsTrigger>
                            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                        </TabsList>

                        {activeTab === 'write' && (
                            <div className="flex items-center gap-1">
                                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('bold')} title="Bold">
                                    <Bold className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('italic')} title="Italic">
                                    <Italic className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('heading')} title="Heading">
                                    <Heading className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('list')} title="Bullet List">
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('ordered-list')} title="Ordered List">
                                    <ListOrdered className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('link')} title="Link">
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <TabsContent value="write" className="p-0 m-0 border-0">
                        <Textarea
                            id={id || 'markdown-editor'}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                            className="min-h-[150px] border-0 focus-visible:ring-0 rounded-none resize-y"
                            rows={rows}
                            required={required}
                        />
                    </TabsContent>

                    <TabsContent value="preview" className="p-4 m-0 min-h-[150px] prose prose-sm max-w-none prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-5 prose-ol:pl-5">
                        {value ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {value}
                            </ReactMarkdown>
                        ) : (
                            <p className="text-gray-400 italic">Nothing to preview</p>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
            <p className="text-xs text-gray-500">
                Supports Markdown formatting
            </p>
        </div>
    )
}
