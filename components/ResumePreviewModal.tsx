"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, Download, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumePreviewModalProps {
  url?: string | null;
  publicId?: string | null;
  open?: boolean;
  onClose: () => void;
}

export default function ResumePreviewModal({
  url,
  publicId,
  open,
  onClose,
}: ResumePreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(true);
  const blobRef = useRef<string | null>(null);

  const isOpen = open ?? !!url;

  useEffect(() => {
    if (!isOpen) return;

    fetchAndPreview();

    // Refresh signed URL before expiry (5 min → refresh at 4 min)
    const interval = setInterval(fetchAndPreview, 4 * 60 * 1000);

    return () => {
      clearInterval(interval);
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, [url, publicId, isOpen]);

  async function fetchAndPreview() {
    setLoading(true);
    setError(null);

    try {
      let finalPublicId = publicId;

      // Fallback for legacy URLs
      if (!finalPublicId && url) {
        const parts = url.split("/");
        const uploadIndex = parts.findIndex((p) => p === "upload");
        if (uploadIndex !== -1) {
          let start = uploadIndex + 1;
          if (parts[start]?.startsWith("v")) start++;
          finalPublicId = parts.slice(start).join("/");
        }
      }

      if (!finalPublicId) {
        throw new Error("Resume ID missing. Please re-upload.");
      }

      // Determine if PDF based on extension
      const extension = finalPublicId.split(".").pop()?.toLowerCase();
      const isPdfFile = extension === "pdf";
      setIsPdf(isPdfFile);

      const token = localStorage.getItem("token");

      const signRes = await fetch(
        `/api/resume/sign?publicId=${encodeURIComponent(finalPublicId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!signRes.ok) {
        const data = await signRes.json();
        throw new Error(data.error || "Failed to sign URL");
      }

      const { signedUrl } = await signRes.json();
      setSignedUrl(signedUrl);

      const pdfRes = await fetch(signedUrl);
      if (!pdfRes.ok) throw new Error("Failed to load PDF");

      const blob = await pdfRes.blob();

      // Force application/pdf for PDF files to prevent auto-download
      const finalBlob = isPdfFile
        ? new Blob([blob], { type: "application/pdf" })
        : blob;

      const newBlobUrl = URL.createObjectURL(finalBlob);

      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
      blobRef.current = newBlobUrl;
      setBlobUrl(newBlobUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Preview failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!signedUrl) return;

    try {
      const res = await fetch(signedUrl);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "Resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to download resume.");
    }
  }

  if (!isOpen && !url) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-4 pr-12 border-b flex justify-between flex-row items-center">
          <div>
            <DialogTitle>Secure Resume Preview</DialogTitle>
            <DialogDescription className="sr-only">
              Secure resume preview
            </DialogDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

          </div>
        </DialogHeader>

        <div className="flex-1 bg-gray-100">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Loading preview…</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <p className="text-red-600 text-sm">{error}</p>
              <Button variant="outline" onClick={fetchAndPreview}>
                Retry
              </Button>
            </div>
          ) : !isPdf ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
              <FileText className="w-16 h-16 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Preview not available
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This file type cannot be previewed directly. Please download
                  to view.
                </p>
              </div>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          ) : blobUrl ? (
            <iframe
              src={blobUrl}
              className="w-full h-full"
              style={{ border: "none" }}
              title="Resume Preview"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
