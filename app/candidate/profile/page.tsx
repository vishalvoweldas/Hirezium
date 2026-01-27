"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileText, Eye, Download } from "lucide-react";
import ResumePreviewModal from "@/components/ResumePreviewModal";

export default function CandidateProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    experience: 0,
    skills: [] as string[],
    bio: "",
    resumeUrl: "",
    resumePublicId: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [openPreview, setOpenPreview] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.user.profile) {
        setFormData({
          firstName: data.user.profile.firstName || "",
          lastName: data.user.profile.lastName || "",
          phone: data.user.profile.phone || "",
          location: data.user.profile.location || "",
          experience: data.user.profile.experience || 0,
          skills: data.user.profile.skills || [],
          bio: data.user.profile.bio || "",
          resumeUrl: data.user.profile.resumeUrl || "",
          resumePublicId: data.user.profile.resumePublicId || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a PDF or DOCX file");
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setResumeFile(file);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile)
      return { url: formData.resumeUrl, publicId: formData.resumePublicId };

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", resumeFile);

      const token = localStorage.getItem("token");
      const res = await fetch("/api/upload/resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      return { url: data.url, publicId: data.publicId };
    } catch (error: any) {
      console.error("Resume upload failed:", error);
      alert(error.message || "Failed to upload resume");
      return { url: formData.resumeUrl, publicId: formData.resumePublicId };
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mandatory fields check
    const isMissingFields =
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      formData.experience === undefined ||
      formData.experience === null ||
      !formData.skills ||
      formData.skills.length === 0 ||
      (!formData.resumeUrl && !resumeFile);

    if (isMissingFields) {
      alert("all the red* fields should be provide");
      return;
    }

    setLoading(true);
    try {
      // Upload resume if new file selected
      let resumeUrl = formData.resumeUrl;
      let resumePublicId = formData.resumePublicId;
      if (resumeFile) {
        const uploadResult = await uploadResume();
        resumeUrl = uploadResult.url;
        resumePublicId = uploadResult.publicId;
      }

      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          resumeUrl,
          resumePublicId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Profile updated successfully!");
        router.push("/candidate/home");
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="content-container">
          <h1 className="text-3xl font-heading font-bold mb-8 text-primary-dark">
            Update Profile
          </h1>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">
                    Resume (PDF or DOCX) <span className="text-red-500">*</span>
                  </Label>
                  {formData.resumeUrl && !resumeFile && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-700 flex-1">
                        Current Resume
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setOpenPreview(true)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                    </div>
                  )}
                  {resumeFile && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-700 flex-1">
                        {resumeFile.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setResumeFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      className="hidden"
                    />
                    <label htmlFor="resume">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {formData.resumeUrl
                            ? "Replace Resume"
                            : "Upload Resume"}
                        </span>
                      </Button>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Accepted formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567891"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">
                    Years of Experience <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experience: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Skills <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddSkill())
                      }
                    />
                    <Button type="button" onClick={handleAddSkill}>
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading || uploading}>
                    {uploading
                      ? "Uploading Resume..."
                      : loading
                        ? "Saving..."
                        : "Save Profile"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <ResumePreviewModal
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        publicId={formData.resumePublicId}
      />
    </div>
  );
}
