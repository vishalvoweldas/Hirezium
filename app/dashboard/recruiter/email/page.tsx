"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  FileSpreadsheet,
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CandidateRow {
  name: string;
  email: string;
  [key: string]: any;
}

export default function BulkEmailPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [file, setFile] = useState<File | null>(null);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successStats, setSuccessStats] = useState<{
    sent: number;
    failed: number;
  } | null>(null);

  // Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsing(true);
    setError(null);
    setSuccessStats(null);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      // Normalize keys to lowercase for standard columns
      const parsedCandidates: CandidateRow[] = jsonData
        .map((row) => {
          // Find keys that look like 'name' or 'email'
          const keys = Object.keys(row);
          const nameKey =
            keys.find((k) => k.toLowerCase().includes("name")) || "Name";
          const emailKey =
            keys.find((k) => k.toLowerCase().includes("email")) || "Email";

          return {
            ...row,
            name: row[nameKey] || "Unknown",
            email: row[emailKey] || "",
          };
        })
        .filter((c) => c.email && c.email.includes("@")); // Basic validation

      if (parsedCandidates.length === 0) {
        throw new Error("No valid candidates found with email addresses.");
      }

      setCandidates(parsedCandidates);
    } catch (err: any) {
      console.error("Parsing error:", err);
      setError(
        'Failed to parse file. Please ensure it contains "Name" and "Email" columns.',
      );
      setCandidates([]);
    } finally {
      setParsing(false);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    setBody((prev) => prev + ` {{${placeholder}}} `);
  };

  const handleSend = async () => {
    if (!file || candidates.length === 0) {
      setError("Please upload a valid candidate list.");
      return;
    }
    if (!subject.trim()) {
      setError("Subject line is required.");
      return;
    }
    if (!body.trim()) {
      setError("Email body is required.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/email/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidates,
          subject,
          body,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send emails.");
      }

      setSuccessStats({ sent: data.sent, failed: data.failed });
      // Clear form optionally, or keep for review
    } catch (err: any) {
      console.error("Sending error:", err);
      setError(err.message || "Failed to send emails. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setFile(null);
    setCandidates([]);
    setSuccessStats(null);
    setSubject("");
    setBody("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="gradient-primary text-white py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/dashboard/recruiter"
            className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-heading font-bold">Email Candidates</h1>
          <p className="text-white/90 mt-2">
            Send personalized bulk emails to your candidate list.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Upload */}
            <Card>
              <CardHeader>
                <CardTitle>1. Upload Candidate List</CardTitle>
                <CardDescription>
                  Upload an Excel or CSV file with "Name" and "Email" columns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={handleFileChange}
                    id="file-upload"
                  />

                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileSpreadsheet className="w-12 h-12 text-green-600" />
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {candidates.length} candidates found
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={reset}
                        className="mt-2"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="font-medium text-gray-900">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">XLSX, XLS or CSV</p>
                    </label>
                  )}
                </div>

                {/* Parsing Error */}
                {error && !sending && !successStats && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Compose */}
            <Card
              className={
                !candidates.length ? "opacity-50 pointer-events-none" : ""
              }
            >
              <CardHeader>
                <CardTitle>2. Compose Email</CardTitle>
                <CardDescription>
                  Write your message. Use placeholders for personalization.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Update on your application..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="body">Message Body</Label>
                    <div className="flex gap-2">
                      <span className="text-xs text-muted-foreground mr-1">
                        Insert:
                      </span>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => insertPlaceholder("CandidateName")}
                      >
                        Name
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => insertPlaceholder("JobTitle")}
                      >
                        Job Title
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => insertPlaceholder("Stage")}
                      >
                        Stage
                      </Badge>
                    </div>
                  </div>
                  <Textarea
                    id="body"
                    rows={10}
                    placeholder="Hello {{CandidateName}}, ..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Use {"{{Placeholder}}"} to insert dynamic data from
                    your Excel file columns.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Send */}
            <div className="flex justify-end pt-4">
              <Button
                size="lg"
                onClick={handleSend}
                disabled={
                  sending || candidates.length === 0 || !subject || !body
                }
                className="w-full md:w-auto min-w-[200px]"
              >
                {sending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send to {candidates.length} Candidates
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column: Preview & Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Preview Card */}
            {candidates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recipient Preview</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {candidates.slice(0, 5).map((c, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {c.name}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {c.email}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {candidates.length > 5 && (
                    <div className="p-4 border-t text-center text-xs text-muted-foreground">
                      And {candidates.length - 5} more...
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Success Status */}
            {successStats && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Emails Sent!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <div className="text-2xl font-bold text-green-600">
                        {successStats.sent}
                      </div>
                      <div className="text-xs text-gray-500">Delivered</div>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <div className="text-2xl font-bold text-red-500">
                        {successStats.failed}
                      </div>
                      <div className="text-xs text-gray-500">Failed</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-white"
                    onClick={reset}
                  >
                    Send New Batch
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
