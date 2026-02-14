import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Briefcase, Users, TrendingUp, Target, BarChart3, Zap } from 'lucide-react'
import TestimonialsSection from '@/components/TestimonialsSection'
import PlacementAnalytics from '@/components/PlacementAnalytics'

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Navbar */}
            <nav className="gradient-primary text-white">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-nowrap items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                        <Link href="/" className="flex items-center gap-0 shrink-0 text-lg md:text-2xl font-heading font-bold">
                            <img src="/icon-transparent.png" alt="Hirezium Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                            <span>Hirezium</span>
                        </Link>
                        <div className="flex items-center gap-1 md:gap-4 shrink-0">
                            <Link href="/jobs">
                                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 px-2 h-8 text-xs md:text-sm md:h-10 md:px-4">
                                    Jobs
                                </Button>
                            </Link>
                            <Link href="/auth/login">
                                <Button variant="secondary" size="sm" className="px-2 h-8 text-xs md:text-sm md:h-10 md:px-4">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button size="sm" className="bg-white text-primary-dark hover:bg-white/90 px-2 h-8 text-xs md:text-sm md:h-10 md:px-4">
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
                            Find Your Dream Job Today
                        </h1>
                        <p className="text-xl mb-8 text-on-gradient-muted">
                            Connect with top companies and discover opportunities that match your skills
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white rounded-lg p-2 flex flex-col md:flex-row gap-2 shadow-2xl">
                            <div className="flex-1 flex items-center px-4 py-2 border-r">
                                <Search className="text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Job title or keyword"
                                    className="flex-1 outline-none text-gray-800"
                                />
                            </div>
                            <div className="flex-1 flex items-center px-4 py-2">
                                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Location"
                                    className="flex-1 outline-none text-gray-800"
                                />
                            </div>
                            <Link href="/jobs">
                                <Button size="lg" className="w-full md:w-auto btn-primary">
                                    Search Jobs
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 mt-12 max-w-2xl mx-auto">
                            <div>
                                <div className="text-4xl font-bold">1000+</div>
                                <div className="text-on-gradient-muted">Active Jobs</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold">500+</div>
                                <div className="text-on-gradient-muted">Companies</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold">10k+</div>
                                <div className="text-on-gradient-muted">Candidates</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="content-container">
                        <h2 className="text-4xl font-heading font-bold text-center mb-12 text-primary-dark">
                            Why Choose Hirezium?
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="card-modern card-hover">
                                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                                    <Search className="text-white" />
                                </div>
                                <h3 className="text-xl font-heading font-semibold mb-3 text-primary-dark">Easy Job Search</h3>
                                <p className="text-secondary-dark">
                                    Find the perfect job with our advanced search filters and personalized recommendations
                                </p>
                            </div>
                            <div className="card-modern card-hover">
                                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                                    <Briefcase className="text-white" />
                                </div>
                                <h3 className="text-xl font-heading font-semibold mb-3 text-primary-dark">Top Companies</h3>
                                <p className="text-secondary-dark">
                                    Connect with leading companies across various industries looking for talent like you
                                </p>
                            </div>
                            <div className="card-modern card-hover">
                                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                                    <TrendingUp className="text-white" />
                                </div>
                                <h3 className="text-xl font-heading font-semibold mb-3 text-primary-dark">Career Growth</h3>
                                <p className="text-secondary-dark">
                                    Track your applications and get insights to improve your job search success rate
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="content-container">
                        <h2 className="text-4xl font-heading font-bold text-center mb-6 text-primary-dark">
                            About Us
                        </h2>
                        <div className="max-w-3xl mx-auto text-center">
                            <p className="text-lg text-secondary-dark mb-8 leading-relaxed">
                                Hirezium is a modern job portal connecting talented professionals with leading companies.
                                We streamline the hiring process, making it faster and more efficient for both candidates
                                and recruiters to find their perfect match. Our platform leverages cutting-edge technology
                                to ensure the best hiring outcomes.
                            </p>
                            <div className="grid md:grid-cols-3 gap-6 mt-8">
                                <div className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100 hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 mx-auto mb-4 gradient-primary rounded-lg flex items-center justify-center">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-primary-dark mb-2">Trusted Platform</h3>
                                    <p className="text-sm text-secondary-dark">
                                        Verified companies and authentic job listings you can trust
                                    </p>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100 hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-primary-dark mb-2">Proven Results</h3>
                                    <p className="text-sm text-secondary-dark">
                                        Thousands of successful placements yearly across top companies
                                    </p>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100 hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-primary-dark mb-2">Fast Hiring</h3>
                                    <p className="text-sm text-secondary-dark">
                                        Streamlined process from application to offer in record time
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Placement Analytics Section */}
            <PlacementAnalytics />

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* CTA Section */}
            <section className="text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-heading font-bold mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl mb-8 text-on-gradient-muted">
                        Join thousands of job seekers and employers on Hirezium
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link href="/auth/signup">
                            <Button size="lg" className="bg-white text-primary-dark text-lg font-semibold">
                                Sign Up as Candidate
                            </Button>
                        </Link>
                        <Link href="/auth/recruiter-register">
                            <Button size="lg" className="bg-white text-primary-dark text-lg font-semibold">
                                Register as Recruiter
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-white py-12 border-t border-white/10">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        {/* Brand Section */}
                        <div>
                            <div className="flex items-center gap-0 mb-4">
                                <img src="/icon-transparent.png" alt="Hirezium Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                                <h3 className="text-2xl font-heading font-bold">Hirezium</h3>
                            </div>
                            <p className="text-on-gradient-muted">
                                Connecting talented professionals with their dream careers.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-on-gradient-muted">
                                <li>
                                    <Link href="/jobs" className="hover:text-white transition-colors">
                                        Browse Jobs
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/auth/signup" className="hover:text-white transition-colors">
                                        Sign Up
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/auth/recruiter-register" className="hover:text-white transition-colors">
                                        For Recruiters
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Social Media */}
                        <div>
                            <h4 className="font-semibold mb-4">Follow Us</h4>
                            <div className="flex gap-4">
                                <a
                                    href="https://youtube.com/@hirezium?si=4S8Gza6YAvI3SgIu"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                                    aria-label="YouTube"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://www.instagram.com/hirezium?igsh=aW95Z2p0NDFqaDRv"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                                    aria-label="Instagram"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/veeresh-voweldas-711945267"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                                    aria-label="LinkedIn"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="text-center pt-8 border-t border-white/10">
                        <p className="text-on-gradient-muted">
                            © 2024 Hirezium. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
