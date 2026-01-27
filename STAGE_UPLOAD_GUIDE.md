# How to Upload Excel/PDF for Stage Progression

## Step-by-Step Guide for Recruiters

### 1. Navigate to Stage Management

1. Login as a **Recruiter**
2. Go to **Dashboard** → **Applicants**
3. Select a specific job from the dropdown (not "All Jobs")
4. Click the **"Manage Stages"** button

### 2. View Stage Overview

You'll see:
- **Total Stages** - Number of interview rounds for this job
- **Total Applications** - All candidates who applied
- **Selected** - Candidates who passed all stages
- **Rejected** - Candidates who were rejected

### 3. Filter Candidates by Stage

Click on stage buttons to view candidates at each stage:
- **Stage 1**, **Stage 2**, etc. - Active candidates
- **Selected** (Green) - Placed candidates
- **Rejected** (Red) - Rejected candidates

### 4. Upload Excel/PDF to Progress Candidates

**When viewing a specific stage:**

1. You'll see the **"Upload Stage X Results"** card
2. Click **"Choose File"** and select your Excel or PDF file
3. Click **"Upload and Update Stages"**

**What happens:**
- ✅ Candidates **in the file** → Move to next stage
- ❌ Candidates **NOT in the file** → Automatically rejected
- 📧 **All candidates** receive email notifications

### 5. File Format Requirements

#### Excel Format (.xlsx)
```
| Email                    |
|--------------------------|
| candidate1@example.com   |
| candidate2@example.com   |
| candidate3@example.com   |
```

**Important:**
- Email addresses should be in the **first column**
- Header row is optional
- Only valid email addresses will be processed

#### PDF Format
```
candidate1@example.com
candidate2@example.com
candidate3@example.com
```

**Important:**
- One email address per line
- Or emails in a table format

### 6. After Upload

You'll see a summary:
- **Progressed to next stage**: X candidates
- **Rejected**: Y candidates
- Any errors (if applicable)

The page will automatically refresh to show updated candidate statuses.

---

## Example Workflow

### Job with 3 Stages

**Initial State:**
- 10 candidates applied → All at Stage 1

**After Stage 1 Interview:**
1. Go to "Manage Stages"
2. Select "Stage 1" tab
3. Upload Excel with 6 candidates who passed
4. **Result:**
   - 6 candidates → Move to Stage 2
   - 4 candidates → Rejected
   - All 10 receive emails

**After Stage 2 Interview:**
1. Select "Stage 2" tab
2. Upload Excel with 4 candidates who passed
3. **Result:**
   - 4 candidates → Move to Stage 3
   - 2 candidates → Rejected
   - All 6 receive emails

**After Final Stage (Stage 3):**
1. Select "Stage 3" tab
2. Upload Excel with 2 candidates who passed
3. **Result:**
   - 2 candidates → **SELECTED** (Placed)
   - 2 candidates → Rejected
   - All 4 receive emails
   - Job's placement count increases by 2

---

## Access Path

**URL Pattern:**
```
/dashboard/recruiter/applicants/[jobId]/stages
```

**Navigation:**
```
Dashboard → Applicants → Select Job → Manage Stages
```

---

## Features

✅ View candidates by stage
✅ Upload Excel/PDF for batch processing
✅ Automatic email notifications
✅ Real-time stage breakdown
✅ Selected/Rejected tracking
✅ Candidate details table

---

## Troubleshooting

**"No valid email addresses found"**
- Check that emails are in the first column (Excel)
- Ensure emails are properly formatted
- Verify file is .xlsx or .pdf format

**Candidates not progressing**
- Ensure email addresses match exactly (case-insensitive)
- Check that you selected the correct current stage
- Verify file uploaded successfully

**Emails not sending**
- Check email configuration in `.env` file
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- Check server logs for email errors
