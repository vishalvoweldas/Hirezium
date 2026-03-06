# Hirezium - Modern SaaS Job Portal

A production-ready job portal SaaS featuring a comprehensive multi-stage recruitment workflow, 3-layer authentication (Admin, Recruiter, Candidate), and built with Next.js 15, Prisma, and PostgreSQL.

## 🚀 Key Features

- **3-Layer Authentication**: Secure access for Admin, Recruiter (requires admin approval), and Candidate roles.
- **Multi-Stage Recruitment**: Define and track candidates through 1-10 customizable interview rounds.
- **Job Management**: Advanced tools for recruiters to post, edit, and manage job listings.
- **Application Tracking System (ATS)**: Integrated candidate tracking with visual progress indicators.
- **Data Export & Analytics**: Export applicant details to Excel/PDF and visualize placement trends.
- **Bulk Communication**: Personalized email campaigns via Excel/CSV uploads with dynamic placeholders.
- **Modern UI/UX**: Premium gradient theme (#124A59 → #08262C), glassmorphism effects, and fully responsive design.
- **Automated Notifications**: Real-time email alerts for applications, stage updates, and selection.

## � User Roles & Workflow

### 1. Admin
- **Role**: System overseer.
- **Responsibilities**: Approving new Recruiter registrations, managing system-wide settings, and viewing high-level analytics.
- **Workflow**: Log in -> Review pending Recruiters -> Approve/Reject -> Monitor platform activity.

### 2. Recruiter
- **Role**: Talent seeker.
- **Responsibilities**: Posting jobs, defining interview stages (1-10 rounds), managing applicants, and exporting data.
- **Workflow**: Register -> Wait for Approval -> Post Job -> Review Applications -> Move Candidates through Stages -> Select/Reject.

### 3. Candidate
- **Role**: Job seeker.
- **Responsibilities**: Building a profile, searching for jobs, and applying with resumes.
- **Workflow**: Sign up -> Complete Profile -> Search Jobs -> Apply -> Track Status in Real-time.

---

## �📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon, Supabase, or local instance)
- Cloudinary account for secure file storage
- Gmail or SMTP service for automated emails

## 🛠️ Installation & Setup

### 1. Clone the project and install dependencies

```bash
cd hirezium
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and populate it with your credentials:

```env
# Database Connection
DATABASE_URL="your-postgresql-connection-string"

# Authentication
JWT_SECRET="your-secure-jwt-secret"

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="Hirezium <noreply@yourdomain.com>"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database

Run the following commands to set up your schema and generate the client:

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Initial Data (Optional)

To populate the database with sample jobs and default users for testing:

```bash
npx tsx prisma/seed.ts
```

> [!NOTE]
> Default credentials for seeded users are outputted to the console after the script runs.

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the portal.

## 🏗️ Project Architecture

```
hirezium/
├── app/                  # Next.js App Router (Pages & API)
│   ├── api/              # Backend API endpoints
│   ├── (auth)/           # Authentication flows
│   ├── dashboard/        # Role-specific user interfaces
│   └── jobs/             # Public job listings and applications
├── components/           # Reusable UI components (Shadcn UI)
├── lib/                  # Shared utilities, validation, and core logic
├── prisma/               # Database schema and migration tracking
└── public/               # Static assets
```

## 🎨 Tech Stack & Usage

### Frontend
- **Next.js 15 (App Router)**: Core framework for server-side rendering, routing, and API handling.
- **React 19**: UI library for building interactive components and managing application state.
- **Tailwind CSS**: Utility-first CSS framework used for all styling and responsive design.
- **Shadcn UI**: High-quality UI component library built on Radix UI, used for modals, buttons, forms, and tables.
- **Lucide React**: Icon library used across all dashboards and portal pages.

### Backend & Database
- **Next.js API Routes**: Serverless functions handling all backend logic, authentication, and data transactions.
- **Prisma ORM**: Type-safe database client used for all PostgreSQL interactions and migrations.
- **PostgreSQL (Neon/Supabase)**: Relational database used for storing users, jobs, applications, and profiles.
- **Bcryptjs**: Used for secure password hashing during signup and authentication.
- **JSON Web Tokens (JWT)**: Secure stateless authentication for protecting routes and API endpoints.

### Integrations & Services
- **Cloudinary**: Cloud-based storage for candidate resumes, using secure server-side signed uploads.
- **Nodemailer / Gmail SMTP**: Service for sending automated email notifications (application status, stage updates).
- **XLSX / jsPDF**: Libraries used for exporting applicant data to Excel spreadsheets and PDF documents.
- **Zod**: TypeScript-first schema validation for both client-side forms and server-side API requests.

## 🔄 Data Flow & Backend Management

### 1. Request Lifecycle
- **Client Request**: Frontend (React) sends a request to a Next.js API route.
- **Middleware**: The request passes through `lib/middleware.ts` for JWT authentication and RBAC.
- **Validation**: Incoming data is validated against Zod schemas in `lib/validation.ts`.
- **API Handler**: The specific route handler in `app/api/` processes the request logic.
- **ORM Interaction**: The handler uses `lib/prisma.ts` to interact with the PostgreSQL database.
- **Response**: The server returns a JSON response with the appropriate HTTP status code.

### 2. Data Management & Storage
- **Relational Mapping**: Prisma ORM manages complex relationships between Users, Profiles, Jobs, and Applications.
- **Cloud Storage**: Resume files (PDF/DOCX) are NOT stored in the database; only URL and PublicID are stored.
- **State Management**: Application statuses (NEW, REVIEWED, STAGE_1-5, SELECTED, REJECTED) are managed via Enums.
- **Data Integrity**: Database-level constraints ensure consistency across the SaaS platform.

## 🔒 Security & Performance

- **Signed Uploads**: Resumes are uploaded securely via server-side API endpoints.
- **RBAC**: Strict role-based access control on all dashboards and API routes.
- **Data Integrity**: Zod-powered validation on both client and server.
- **Optimized Assets**: Image optimization and efficient data fetching with Next.js 15.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for a seamless recruitment experience.
