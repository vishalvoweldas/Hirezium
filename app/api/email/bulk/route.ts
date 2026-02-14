import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware";

// Configure Transporter (Ensure environment variables are set)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Helper to check config
const isConfigured = !!process.env.EMAIL_USER && !!process.env.EMAIL_PASSWORD;

interface Candidate {
  name: string;
  email: string;
  [key: string]: any;
}

async function handler(request: AuthenticatedRequest) {
  try {
    // 1. Role Check
    const userRole = request.user?.role;
    if (userRole !== "RECRUITER" && userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized Access" },
        { status: 403 },
      );
    }

    if (!isConfigured) {
      return NextResponse.json(
        {
          error:
            "SMTP credentials (SMTP_USER, SMTP_PASS) are missing in server configuration.",
        },
        { status: 500 },
      );
    }

    // 2. Parse Body
    const body = await request.json();
    const { candidates, subject, body: emailBody } = body;

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json(
        { error: "No candidates provided" },
        { status: 400 },
      );
    }
    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: "Subject and body are required" },
        { status: 400 },
      );
    }

    // 3. Send Emails (in parallel with concurrency limit could be better, but simple loop for now)
    let sentCount = 0;
    let failedCount = 0;

    // We'll process promises in batches if list is huge, but for <500, Promise.all might be okay
    // Let's do sequential for better error tracking per item or Promise.allSettled

    // Using Promise.allSettled to speed up
    const results = await Promise.allSettled(
      candidates.map(async (candidate: Candidate) => {
        // Personalize
        let personalizedBody = emailBody
          .replace(/{{CandidateName}}/g, candidate.name)
          .replace(/{{CandidateEmail}}/g, candidate.email);
        // Add other replacements dynamically if needed

        // Handle dynamic fields from Excel columns
        Object.keys(candidate).forEach((key) => {
          const regex = new RegExp(`{{${key}}}`, "gi"); // Case insensitive match
          personalizedBody = personalizedBody.replace(regex, candidate[key]);
        });

        // Also personalize subject
        let personalizedSubject = subject.replace(
          /{{CandidateName}}/g,
          candidate.name,
        );

        // Send
        await transporter.sendMail({
          from:
            process.env.EMAIL_FROM || `"Hirezium" <${process.env.EMAIL_USER}>`,
          to: candidate.email,
          subject: personalizedSubject,
          text: personalizedBody, // Plain text for now
          // html: personalizedBody.replace(/\n/g, '<br>') // Simple conversion if needed
        });
      }),
    );

    // 4. Tally Results
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        sentCount++;
      } else {
        console.error("Failed to send email:", result.reason);
        failedCount++;
      }
    });

    return NextResponse.json({
      message: "Batch processing complete",
      sent: sentCount,
      failed: failedCount,
    });
  } catch (error: any) {
    console.error("Bulk email error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const POST = requireAuth(handler);
