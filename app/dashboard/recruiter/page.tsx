"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, FileText, LogOut, BarChart } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function RecruiterDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role !== "RECRUITER" && user.role !== "ADMIN") {
        router.push("/candidate/home");
      } else {
        fetchStats();
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === "RECRUITER" || user.role === "ADMIN")) {
      // Auto-refresh stats every 30 seconds (reduced from 3s to save resources)
      const interval = setInterval(() => {
        fetchStats();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/recruiter/dashboard-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="gradient-primary text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-0 text-lg md:text-2xl font-heading font-bold">
              <img src="/icon-transparent.png" alt="Hirezium Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
              <span>Hirezium</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                Welcome, {user?.profile?.companyName || "Recruiter"}
              </span>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold mb-8">
          Recruiter Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                Jobs you've posted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeJobs}
              </div>
              <p className="text-xs text-muted-foreground">
                Accepting applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applicants
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplicants}</div>
              <p className="text-xs text-muted-foreground">
                Across all your jobs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card
            className="card-hover cursor-pointer"
            onClick={() => router.push("/dashboard/recruiter/jobs/new")}
          >
            <CardHeader>
              <Briefcase className="w-12 h-12 text-primary-dark mb-4" />
              <CardTitle>Post New Job</CardTitle>
              <p className="text-gray-600">
                Create a new job posting to attract talent
              </p>
            </CardHeader>
          </Card>

          <Card
            className="card-hover cursor-pointer"
            onClick={() => router.push("/dashboard/recruiter/jobs")}
          >
            <CardHeader>
              <FileText className="w-12 h-12 text-primary-dark mb-4" />
              <CardTitle>Manage Jobs</CardTitle>
              <p className="text-gray-600">View and edit your job postings</p>
            </CardHeader>
          </Card>

          <Card
            className="card-hover cursor-pointer"
            onClick={() => router.push("/dashboard/recruiter/applicants")}
          >
            <CardHeader>
              <Users className="w-12 h-12 text-primary-dark mb-4" />
              <CardTitle>View Applicants</CardTitle>
              <p className="text-gray-600">
                Review and manage job applications
              </p>
            </CardHeader>
          </Card>

          <Card
            className="card-hover cursor-pointer"
            onClick={() => router.push("/dashboard/recruiter/analytics")}
          >
            <CardHeader>
              <BarChart className="w-12 h-12 text-primary-dark mb-4" />
              <CardTitle>Analytics</CardTitle>
              <p className="text-gray-600">
                View placement metrics and statistics
              </p>
            </CardHeader>
          </Card>

          <Card
            className="card-hover cursor-pointer"
            onClick={() => router.push("/dashboard/placements/manage")}
          >
            <CardHeader>
              <FileText className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Placement Data</CardTitle>
              <p className="text-gray-600">
                Upload placement data for home page
              </p>
            </CardHeader>
          </Card>


          <Card
            className="card-hover cursor-pointer"
            onClick={() => router.push("/dashboard/recruiter/email")}
          >
            <CardHeader>
              <Users className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle>Email Candidates</CardTitle>
              <p className="text-gray-600">
                Send bulk emails to candidates via Excel upload
              </p>
            </CardHeader>
          </Card>

          <Card
            className="card-hover cursor-pointer"
            onClick={() => router.push("/dashboard/recruiter/profile")}
          >
            <CardHeader>
              <Users className="w-12 h-12 text-teal-600 mb-4" />
              <CardTitle>Profile Settings</CardTitle>
              <p className="text-gray-600">
                Update you profile, change password and email
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
