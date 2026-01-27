import { z } from 'zod'

export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    location: z.string().optional(),
})

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

export const recruiterRegisterSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    companyName: z.string().min(2, 'Company name is required'),
    companyWebsite: z.string().url('Invalid website URL').optional().or(z.literal('')),
    phone: z.string().optional(),
    location: z.string().optional(),
    designation: z.string().optional(),
})

export const jobSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(50, 'Description must be at least 50 characters'),
    location: z.string().min(2, 'Location is required'),
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
    experience: z.string().min(1, 'Experience requirement is required'),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
    salary: z.string().optional(),
    isRemote: z.boolean().default(false),
    companyLogo: z.string().url().optional().or(z.literal('')),
    stages: z.number().int().min(1).max(10).default(1),
    deadline: z.string().optional(),
})

export const applicationSchema = z.object({
    jobId: z.string().cuid('Invalid job ID'),
    coverLetter: z.string().optional(),
    resumeUrl: z.string().url('Invalid resume URL').optional(),
    resumePublicId: z.string().optional(),
})

export const profileUpdateSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().min(1, 'Phone number is required'),
    location: z.string().optional(),
    experience: z.number().int().min(0, 'Years of experience is required').max(50),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    resumeUrl: z.string().url('Invalid resume URL').min(1, 'Resume is required').or(z.literal('')),
    resumePublicId: z.string().optional(),
})
