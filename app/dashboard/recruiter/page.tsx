"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, FileText, LogOut, BarChart } from "lucide-react";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchStats();

    // Auto-refresh stats every 3 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();

      if (data.user.role !== "RECRUITER" && data.user.role !== "ADMIN") {
        router.push("/candidate/home");
        return;
      }

      setUser(data.user);
    } catch (error) {
      router.push("/auth/login");
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    try {
      console.log("Fetching stats...", new Date().toLocaleTimeString());
      const res = await fetch("/api/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Filter jobs by current recruiter (this would be done server-side in production)
      const myJobs = data.jobs || [];

      console.log(
        "All jobs from API:",
        myJobs.map((j: any) => ({
          id: j.id,
          title: j.title,
          isActive: j.isActive,
        })),
      );

      const newStats = {
        totalJobs: myJobs.length,
        activeJobs: myJobs.filter((j: any) => j.isActive).length,
        totalApplicants: myJobs.reduce(
          (sum: number, j: any) => sum + (j.applicantCount || 0),
          0,
        ),
      };

      console.log("Stats updated:", newStats);
      setStats(newStats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="gradient-primary text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-heading font-bold">
              HireFlow
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                Welcome, {user?.profile?.companyName || "Recruiter"}
              </span>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={handleLogout}
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
        </div>
      </div>
    </div>
  );
}
