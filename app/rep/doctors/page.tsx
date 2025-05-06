"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/layout/DashboardLayout";
import DoctorTable from "@components/doctors/DoctorTable";
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";
import Modal from "@components/ui/Modal";
import DoctorForm from "@components/doctors/DoctorForm";
import toast from "react-hot-toast";
import { UserPlusIcon } from "@heroicons/react/24/outline";

export default function RepDoctors() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [rep, setRep] = useState(null);
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session.user.role !== "representative") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, session, router]);
  
  const fetchData = async () => {
    try {
      // Fetch rep information
      const repResponse = await fetch("/api/representatives/profile");
      if (!repResponse.ok) {
        throw new Error("Failed to fetch representative profile");
      }
      const repData = await repResponse.json();
      setRep(repData.data);
      
      // Fetch doctors
      const doctorsResponse = await fetch(`/api/doctors?repId=${repData.data.id}`);
      if (!doctorsResponse.ok) {
        throw new Error("Failed to fetch doctors");
      }
      const doctorsData = await doctorsResponse.json();
      setDoctors(doctorsData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddDoctorSuccess = () => {
    setIsAddDoctorModalOpen(false);
    fetchData();
    toast.success("Doctor added successfully");
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!rep) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-800">
            Unable to load your profile information
          </h2>
          <p className="mt-2 text-gray-600">
            Please try again later or contact support
          </p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all the doctors assigned to you
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsAddDoctorModalOpen(true)}
          leftIcon={<UserPlusIcon className="h-5 w-5" />}
        >
          Add Doctor
        </Button>
      </div>
      
      <Card className="mb-6">
        <Card.Content className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Doctor Statistics</h3>
              <p className="mt-1 text-sm text-gray-500">
                Overview of your assigned doctors
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-sm text-gray-500">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {doctors.filter(doctor => doctor.user.status === "active").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {doctors.filter(doctor => doctor.user.status === "pending").length}
                </p>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
      
      <DoctorTable 
        doctors={doctors} 
        role="rep" 
        repId={rep.id}
        clientId={rep.clientId}
        onRefresh={fetchData}
      />
      
      <Modal
        isOpen={isAddDoctorModalOpen}
        onClose={() => setIsAddDoctorModalOpen(false)}
        title="Add New Doctor"
        size="lg"
      >
        <DoctorForm 
          repId={rep.id}
          clientId={rep.clientId}
          onSuccess={handleAddDoctorSuccess}
        />
      </Modal>
    </DashboardLayout>
  );
}
