"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/layout/DashboardLayout";
import Card from "@components/ui/Card";
import Form from "@components/ui/Form";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";
import toast from "react-hot-toast";

export default function DoctorProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    hospital: "",
    bio: "",
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session.user.role !== "doctor") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/doctors/profile`);
      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.data.user.name || "",
          email: data.data.user.email || "",
          phone: data.data.user.phone || "",
          specialty: data.data.specialty || "",
          hospital: data.data.hospital || "",
          bio: data.data.bio || "",
        });
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      toast.error("An error occurred while loading profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await fetch("/api/doctors/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
      
      if (response.ok) {
        toast.success("Profile updated successfully");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while updating profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    setPasswordUpdating(true);
    
    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      
      if (response.ok) {
        toast.success("Password updated successfully");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update password");
      }
    } catch (error) {
      toast.error("An error occurred while updating password");
      console.error(error);
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your personal and professional information
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <Card>
          <Card.Header title="Personal Information" />
          <Card.Content>
            <Form onSubmit={handleProfileSubmit}>
              <Form.Row>
                <Input
                  label="Full Name"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  value={profile.email}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Form.Row>
              
              <Form.Row>
                <Input
                  label="Phone Number"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter your phone number"
                />
                <Input
                  label="Specialty"
                  name="specialty"
                  value={profile.specialty}
                  onChange={handleProfileChange}
                  placeholder="E.g., Cardiology, Neurology, etc."
                />
              </Form.Row>
              
              <Input
                label="Hospital/Clinic"
                name="hospital"
                value={profile.hospital}
                onChange={handleProfileChange}
                placeholder="Where do you practice?"
              />
              
              <Input
                label="Bio"
                name="bio"
                value={profile.bio}
                onChange={handleProfileChange}
                as="textarea"
                rows={4}
                placeholder="Tell us a bit about yourself and your practice"
              />
              
              <Form.Submit>
                <Button type="submit" variant="primary" isLoading={saving}>
                  Save Changes
                </Button>
              </Form.Submit>
            </Form>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header title="Change Password" />
          <Card.Content>
            <Form onSubmit={handlePasswordSubmit}>
              <Input
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                required
              />
              
              <Form.Row>
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  helperText="Minimum 6 characters"
                  required
                />
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Form.Row>
              
              <Form.Submit>
                <Button type="submit" variant="primary" isLoading={passwordUpdating}>
                  Update Password
                </Button>
              </Form.Submit>
            </Form>
          </Card.Content>
        </Card>
      </div>
    </DashboardLayout>
  );
}
