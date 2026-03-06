"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

function CandidateJobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState(
    searchParams?.get("keyword") || "",
  );
  const [searchLocation, setSearchLocation] = useState(
    searchParams?.get("location") || "",
  );
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, [searchParams]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchKeyword) params.set("keyword", searchKeyword);
      if (searchLocation) params.set("location", searchLocation);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/saved-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const ids = new Set<string>(
          data.savedJobs?.map((sj: any) => sj.jobId) || [],
        );
        setSavedJobIds(ids);
      }
    } catch (error) {
      console.error("Failed to fetch saved jobs:", error);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchKeyword) params.set("keyword", searchKeyword);
    if (searchLocation) params.set("location", searchLocation);
    router.push(`/candidate/jobs?${params.toString()}`);
  };

  const toggleSaveJob = async (jobId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const isSaved = savedJobIds.has(jobId);
      const method = isSaved ? "DELETE" : "POST";

      const res = await fetch("/api/saved-jobs", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      });

      if (res.ok) {
        const newSavedIds = new Set(savedJobIds);
        if (isSaved) {
          newSavedIds.delete(jobId);
        } else {
          newSavedIds.add(jobId);
        }
        setSavedJobIds(newSavedIds);
      }
    } catch (error) {
      console.error("Failed to toggle save job:", error);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="content-container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-primary-dark mb-4">
              Find Your Dream Job
            </h1>

            {/* Search Bar */}
            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center px-4 py-2 border rounded-md">
                  <Search className="text-gray-400 mr-2" />
                  <Input
                    type="text"
                    placeholder="Job title or keyword"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="flex-1 outline-none border-none"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="flex-1 flex items-center px-4 py-2 border rounded-md">
                  <MapPin className="text-gray-400 mr-2" />
                  <Input
                    type="text"
                    placeholder="Location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="flex-1 outline-none border-none"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} className="btn-primary">
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : jobs.length > 0 ? (
            <div>
              <p className="text-sm text-secondary-dark mb-4">
                Found {jobs.length} job{jobs.length !== 1 ? "s" : ""}
              </p>
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <Card key={job.id} className="card-modern">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-primary-dark mb-2">
                            {job.title}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-dark">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              <span>{job.jobType}</span>
                            </div>
                            {job.workMode === 'REMOTE' && (
                              <Badge className="bg-green-100 text-green-800 border-none">Remote</Badge>
                            )}
                            {job.workMode === 'ON_SITE' && (
                              <Badge variant="outline" className="text-blue-700 border-blue-200">On-site</Badge>
                            )}
                            {job.workMode === 'HYBRID' && (
                              <Badge className="bg-purple-100 text-purple-800 border-none">Hybrid</Badge>
                            )}
                            {job.salary && (
                              <div className="flex items-center gap-2 ml-auto pr-4">
                                <span className="text-xs text-gray-400 uppercase">CTC</span>
                                <span className="text-base font-bold text-green-600">
                                  {job.salary}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job.id);
                          }}
                        >
                          {savedJobIds.has(job.id) ? (
                            <BookmarkCheck className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Bookmark className="w-5 h-5 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-secondary-dark mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          className="btn-primary"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-primary-dark mb-2">
                No jobs found
              </h3>
              <p className="text-secondary-dark mb-4">
                Try adjusting your search criteria
              </p>
              <Button
                onClick={() => {
                  setSearchKeyword("");
                  setSearchLocation("");
                  router.push("/candidate/jobs");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CandidateJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          Loading jobs...
        </div>
      }
    >
      <CandidateJobsContent />
    </Suspense>
  );
}
