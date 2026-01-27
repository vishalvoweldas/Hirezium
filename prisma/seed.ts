import { PrismaClient, UserRole, ApprovalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Admin User
  const adminPassword = await bcrypt.hash("hireflow@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "hireflow.notifications@gmail.com" },
    update: {},
    create: {
      email: "hireflow.notifications@gmail.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      approvalStatus: ApprovalStatus.APPROVED,
    },
  });

  console.log("✅ Created admin user:", admin.email);

  // Create Sample Recruiter
  const recruiterPassword = await bcrypt.hash("veeresh@21", 10);
  const recruiter = await prisma.user.upsert({
    where: { email: "voweldasveeresh@gmail.com" },
    update: {},
    create: {
      email: "voweldasveeresh@gmail.com",
      password: recruiterPassword,
      role: UserRole.RECRUITER,
      approvalStatus: ApprovalStatus.APPROVED,
      recruiterProfile: {
        create: {
          companyName: "TechCorp Solutions",
          companyWebsite: "https://techcorp.com",
          phone: "+1234567890",
          location: "San Francisco, CA",
          designation: "HR Manager",
        },
      },
    },
  });

  console.log("✅ Created recruiter user:", recruiter.email);

  // Create Sample Candidate
  const candidatePassword = await bcrypt.hash("candidate123", 10);
  const candidate = await prisma.user.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
      email: "john.doe@example.com",
      password: candidatePassword,
      role: UserRole.CANDIDATE,
      approvalStatus: ApprovalStatus.APPROVED,
      candidateProfile: {
        create: {
          firstName: "John",
          lastName: "Doe",
          phone: "+1234567891",
          location: "New York, NY",
          experience: 3,
          skills: ["JavaScript", "React", "Node.js", "TypeScript"],
          bio: "Passionate full-stack developer with 3 years of experience.",
          profileCompletion: 80,
        },
      },
    },
  });

  console.log("✅ Created candidate user:", candidate.email);

  // Create Sample Jobs
  const job1 = await prisma.job.create({
    data: {
      recruiterId: recruiter.id,
      title: "Senior Full Stack Developer",
      description:
        "We are looking for an experienced Full Stack Developer to join our team. You will work on cutting-edge web applications using modern technologies.",
      location: "San Francisco, CA",
      jobType: "FULL_TIME",
      experience: "3-5 years",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
      salary: "$120k - $160k",
      isActive: true,
      isRemote: true,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      recruiterId: recruiter.id,
      title: "Frontend Developer",
      description:
        "Join our frontend team to build beautiful and responsive user interfaces. Experience with React and modern CSS frameworks required.",
      location: "Remote",
      jobType: "FULL_TIME",
      experience: "2-4 years",
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
      salary: "$90k - $130k",
      isActive: true,
      isRemote: true,
    },
  });

  console.log("✅ Created sample jobs");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📝 Login Credentials:");
  console.log("Admin: hireflow.notifications@gmail.com / hireflow@123");
  console.log("Recruiter: voweldasveeresh@gmail.com / veeresh@21");
  console.log("Candidate: john.doe@example.com / candidate123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
