# HireFlow - Modern SaaS Job Portal

A production-ready job portal SaaS with 3-layer authentication (Admin, Recruiter, Candidate), built with Next.js, Prisma, and PostgreSQL.

## 🚀 Features

- **3-Layer Authentication**: Admin, Recruiter (with approval), and Candidate roles
- **Job Management**: Post, edit, delete, and manage jobs
- **Application Tracking**: Apply to jobs, track status, manage applicants
- **Data Export**: Export applicant data in Excel/PDF with custom filters
- **Responsive Design**: Mobile-first with bottom navigation and sticky CTAs
- **Modern UI**: Gradient theme (#124A59 → #08262C) with glassmorphism effects
- **Bulk Email**: Send personalized emails to candidates via Excel/CSV upload
- **File Upload**: Resume uploads via Cloudinary
- **Role-Based Access**: Protected routes and API endpoints

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon or Supabase recommended for free hosting)
- Cloudinary account for file uploads

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd "d:\VISHAL STUFF\Hirevo"
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/hireflow?sslmode=require"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="HireFlow <noreply@hireflow.com>"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

#### Option A: Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string and add it to `.env` as `DATABASE_URL`

#### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → Database and copy the connection string
4. Add it to `.env` as `DATABASE_URL`

### 4. Set Up Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. From your dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
3. Add them to your `.env` file

### 5. Run Database Migrations

```bash
npx prisma generate
npx prisma db push
```

### 6. Seed the Database

```bash
npx tsx prisma/seed.ts
```

This will create:

- **Admin**: hireflow.notifications@gmail.com / hireflow@123
- **Recruiter**: voweldasveeresh@gmail.com / veeresh@21
- **Candidate**: john.doe@example.com / candidate123
- Sample jobs

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚢 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/hireflow.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" and import your repository
3. Configure environment variables:
   - Add all variables from your `.env` file
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
4. Click "Deploy"

### 3. Run Migrations in Production

After deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run migrations
vercel env pull .env.production
npx prisma db push
npx tsx prisma/seed.ts
```

## 📱 Usage

### Admin Dashboard

- Login with admin credentials
- Approve/reject recruiter registrations
- Manage all jobs and applicants
- View system-wide analytics

### Recruiter Dashboard

- Register and wait for admin approval
- Post and manage jobs
- View applicants for your jobs
- Export applicant data (Excel/PDF)
- Update application status

### Candidate Portal

- Sign up and create profile
- Search and filter jobs
- Apply to jobs with resume
- Save jobs for later
- Track application status

## 🏗️ Project Structure

```
hireflow/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Role-based dashboards
│   ├── jobs/             # Job pages
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/
│   └── ui/               # Shadcn UI components
├── lib/
│   ├── auth.ts           # Authentication utilities
│   ├── cloudinary.ts     # File upload
│   ├── export.ts         # Data export
│   ├── middleware.ts     # Auth middleware
│   ├── prisma.ts         # Prisma client
│   ├── utils.ts          # Utility functions
│   └── validation.ts     # Zod schemas
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── package.json
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Server-side validation
- Protected API routes
- File upload validation (5MB limit, PDF/DOC/DOCX only)

## 📊 Database Schema

- **User**: Authentication and role management
- **CandidateProfile**: Candidate information
- **RecruiterProfile**: Recruiter/company information
- **Job**: Job postings
- **Application**: Job applications
- **SavedJob**: Saved jobs for candidates

## 🎨 Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon/Supabase)
- **Authentication**: JWT, bcryptjs
- **File Storage**: Cloudinary
- **Data Export**: xlsx, jspdf
- **Deployment**: Vercel

## 📝 API Endpoints

### Authentication

- `POST /api/auth/signup` - Candidate signup
- `POST /api/auth/login` - Login
- `POST /api/auth/recruiter-register` - Recruiter registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Jobs

- `GET /api/jobs` - List jobs (with filters)
- `POST /api/jobs` - Create job (Recruiter/Admin)
- `GET /api/jobs/[id]` - Get job details
- `PUT /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job

### Applications

- `GET /api/applications` - List applications (role-based)
- `POST /api/applications` - Apply to job (Candidate)
- `PUT /api/applications/[id]` - Update status (Recruiter/Admin)

### Admin

- `GET /api/admin/recruiters` - List recruiters
- `PUT /api/admin/recruiters` - Approve/reject recruiter

### Export

- `GET /api/export/applicants/[jobId]` - Export applicants data

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure your DATABASE_URL is correct
- Check if your IP is whitelisted (for Neon/Supabase)
- Verify SSL mode is set to `require`

### File Upload Issues

- Verify Cloudinary credentials
- Check file size (max 5MB)
- Ensure file type is PDF, DOC, or DOCX

### Build Errors

- Run `npm install` to ensure all dependencies are installed
- Run `npx prisma generate` to regenerate Prisma client
- Clear `.next` folder and rebuild

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and modern web technologies
