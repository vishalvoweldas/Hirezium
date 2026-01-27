# Multi-Stage Recruitment Workflow - Setup Guide

## Quick Start

### 1. Install Dependencies (Already Done)

```bash
npm install
```

### 2. Configure Email Service

Copy the email configuration template:

```bash
# Add these to your .env file
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="HireFlow <noreply@hireflow.com>"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For Gmail:**

1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `EMAIL_PASSWORD`

### 3. Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

This will regenerate Prisma Client with the new schema fields.

---

## New Features

### 🎯 Multi-Stage Job Postings

- Define 1-10 interview rounds when posting jobs
- Track candidates through each stage
- Visual progress indicators

### 📧 Automated Email Notifications

- Application received confirmation
- Stage progression updates
- Rejection notifications
- Selection/placement congratulations

### 📊 Excel/PDF Stage Upload

- Upload candidate lists to progress stages
- Automatic rejection for candidates not in list
- Batch processing with email notifications

### 📧 Recruiter Bulk Email

- Send personalized emails to candidate lists
- Excel/CSV upload support
- Dynamic placeholders ({{CandidateName}}, etc.)
- Real-time sending status

### 📈 Placement Analytics

- Real-time placement metrics
- Conversion rate tracking
- Monthly trends visualization
- Job performance comparison

---

## Testing Checklist

### ✅ Database Migration

- [x] Schema updated with stages, currentStage, selectedCount
- [x] ApplicationStatus enum updated with STAGE_1-5, SELECTED
- [ ] Verify by restarting dev server

### ✅ Email Configuration

- [ ] Add email credentials to .env
- [ ] Test email sending by applying to a job
- [ ] Verify "Application Received" email arrives

### ✅ Job Creation with Stages

- [ ] Navigate to `/dashboard/recruiter/jobs/new`
- [ ] Create job with 3 stages
- [ ] Verify stages field appears and saves

### ✅ Stage Upload

- [ ] Create Excel file with candidate emails
- [ ] Apply to job as multiple candidates
- [ ] Upload Excel file for stage progression
- [ ] Verify emails sent and statuses updated

### ✅ Bulk Email

- [ ] Navigate to `/dashboard/recruiter/email`
- [ ] Upload Excel with Name, Email columns
- [ ] Compose email with `{{CandidateName}}`
- [ ] Send and verify delivery

### ✅ Analytics Dashboard

- [ ] Navigate to `/dashboard/recruiter/analytics`
- [ ] Verify charts display
- [ ] Check placement metrics

---

## File Upload Format

### Excel (.xlsx)

```
| Email                    |
|--------------------------|
| candidate1@example.com   |
| candidate2@example.com   |
```

### PDF

```
candidate1@example.com
candidate2@example.com
candidate3@example.com
```

---

## API Endpoints

| Endpoint                       | Method | Description                   |
| ------------------------------ | ------ | ----------------------------- |
| `/api/jobs/[id]/stages`        | GET    | Get stage breakdown           |
| `/api/jobs/[id]/stages`        | PUT    | Update number of stages       |
| `/api/jobs/[id]/stages/upload` | POST   | Upload stage progression file |
| `/api/analytics/placements`    | GET    | Get placement analytics       |

---

## Components

- **StageUpload** - File upload component for stage progression
- **StageProgress** - Visual progress indicator for candidates
- **Analytics Dashboard** - Placement metrics and charts

---

## Troubleshooting

### TypeScript Errors

If you see Prisma-related TypeScript errors, restart the dev server to regenerate Prisma Client.

### Email Not Sending

- Verify email credentials in .env
- Check EMAIL_HOST and EMAIL_PORT
- For Gmail, ensure app password is used (not regular password)
- Check console for email errors

### File Upload Errors

- Ensure file is .xlsx or .pdf format
- Verify email addresses are in correct format
- Check first column for Excel files

---

## Production Deployment

Before deploying to production:

1. Set production email credentials
2. Update `NEXT_PUBLIC_APP_URL` to production domain
3. Test email delivery in production
4. Consider email rate limiting for bulk operations
5. Monitor email sending logs

---

## Support

For issues or questions:

1. Check the walkthrough documentation
2. Review API endpoint documentation
3. Verify email configuration
4. Check browser console and server logs
