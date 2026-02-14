import { Star } from 'lucide-react'
import Image from 'next/image'

interface Testimonial {
    id: number
    name: string
    role: string
    company: string
    feedback: string
    imageUrl?: string
    rating: number
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Sarah Johnson",
        role: "Senior Software Engineer",
        company: "Google",
        feedback: "Hirezium made my job search incredibly smooth. I got placed at my dream company within 3 weeks! The platform's matching algorithm is spot-on.",
        imageUrl: "/testimonials/sarah.png",
        rating: 5
    },
    {
        id: 2,
        name: "Michael Chen",
        role: "Product Manager",
        company: "Microsoft",
        feedback: "The recruiter connections on Hirezium are top-notch. I received multiple offers and found the perfect role that aligned with my career goals.",
        imageUrl: "/testimonials/michael.png",
        rating: 5
    },
    {
        id: 3,
        name: "Priya Sharma",
        role: "Data Scientist",
        company: "Amazon",
        feedback: "As a career switcher, Hirezium helped me land my first data science role. The platform's resources and job matches were exactly what I needed.",
        imageUrl: "/testimonials/priya.png",
        rating: 5
    },
    {
        id: 4,
        name: "David Martinez",
        role: "UX Designer",
        company: "Meta",
        feedback: "I was skeptical at first, but Hirezium exceeded my expectations. The application tracking and recruiter feedback features are game-changers.",
        imageUrl: "/testimonials/david.png",
        rating: 5
    },
    {
        id: 5,
        name: "Emily Thompson",
        role: "Marketing Manager",
        company: "Salesforce",
        feedback: "Hirezium's platform is intuitive and professional. I appreciated the personalized job recommendations and quick response from recruiters.",
        rating: 5
    },
    {
        id: 6,
        name: "Raj Patel",
        role: "Full Stack Developer",
        company: "Netflix",
        feedback: "Within 2 weeks of signing up, I had 5 interviews lined up. Hirezium's efficiency and quality of job matches are unmatched!",
        rating: 5
    }
]

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
}

export default function TestimonialsSection() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="content-container">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-heading font-bold mb-4 text-primary-dark">
                            Hear From Our Placed Candidates
                        </h2>
                        <p className="text-xl text-secondary-dark max-w-2xl mx-auto">
                            Join thousands of professionals who found their dream jobs through Hirezium
                        </p>
                    </div>

                    {/* Testimonials Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="card-modern card-hover bg-white p-6 transition-all duration-300 hover:scale-[1.02]"
                            >
                                {/* Header with Avatar and Info */}
                                <div className="flex items-start gap-4 mb-4">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {testimonial.imageUrl ? (
                                            <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#124A59]/20">
                                                <Image
                                                    src={testimonial.imageUrl}
                                                    alt={`${testimonial.name} - ${testimonial.role} at ${testimonial.company}`}
                                                    width={56}
                                                    height={56}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#124A59] to-[#08262C] flex items-center justify-center ring-2 ring-[#124A59]/20">
                                                <span className="text-white font-semibold text-lg">
                                                    {getInitials(testimonial.name)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Name and Role */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-primary-dark text-lg mb-1">
                                            {testimonial.name}
                                        </h3>
                                        <p className="text-sm text-secondary-dark">
                                            {testimonial.role}
                                        </p>
                                        <p className="text-sm font-medium text-primary-dark">
                                            @ {testimonial.company}
                                        </p>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex gap-1 mb-3">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                        />
                                    ))}
                                </div>

                                {/* Feedback */}
                                <p className="text-secondary-dark text-sm leading-relaxed mb-4">
                                    "{testimonial.feedback}"
                                </p>

                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#124A59]/10 to-[#08262C]/10 rounded-full">
                                    <img src="/icon-transparent.png" alt="Icon" className="w-4 h-4 object-contain" />
                                    <span className="text-xs font-medium text-primary-dark">
                                        Placed via Hirezium
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="text-center">
                        <button className="btn-primary px-8 py-3 text-base font-semibold">
                            View More Success Stories
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
