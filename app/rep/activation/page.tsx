"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/layout/DashboardLayout";
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";
import Modal from "@components/ui/Modal";
import { formatDate } from "@lib/utils";
import toast from "react-hot-toast";
import { EnvelopeIcon, PhoneIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import { Tab } from "@headlessui/react";

export default function RepActivation() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [rep, setRep] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  
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
      
      // Fetch doctors with pending status
      const doctorsResponse = await fetch(`/api/doctors?repId=${repData.data.id}&status=pending`);
      if (!doctorsResponse.ok) {
        throw new Error("Failed to fetch doctors");
      }
      const doctorsData = await doctorsResponse.json();
      setPendingDoctors(doctorsData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load pending doctors");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateOtp = async (doctor) => {
    try {
      setSelectedDoctor(doctor);
      
      // Generate random 6-digit OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      
      // In a real app, you would send this OTP to the doctor
      // For now we'll just show it in the modal
      setIsOtpModalOpen(true);
      
      // Simulate sending OTP to doctor
      toast.success(`OTP generated for ${doctor.user.name}`);
    } catch (error) {
      console.error("Error generating OTP:", error);
      toast.error("Failed to generate OTP");
    }
  };
  
  const handleSendActivationEmail = async (doctorId) => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}/send-activation`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to send activation email");
      }
      
      toast.success("Activation email sent successfully");
    } catch (error) {
      console.error("Error sending activation email:", error);
      toast.error("Failed to send activation email");
    }
  };
  
  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }
    
    if (otp !== generatedOtp) {
      toast.error("Invalid OTP. Please try again.");
      return;
    }
    
    setIsSubmittingOtp(true);
    
    try {
      // Activate the doctor's account
      const response = await fetch(`/api/doctors/${selectedDoctor.id}/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activationMethod: "otp" }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to activate doctor");
      }
      
      toast.success(`${selectedDoctor.user.name}'s account activated successfully`);
      setIsOtpModalOpen(false);
      setOtp("");
      setGeneratedOtp("");
      setSelectedDoctor(null);
      fetchData();
    } catch (error) {
      console.error("Error activating doctor:", error);
      toast.error("Failed to activate doctor account");
    } finally {
      setIsSubmittingOtp(false);
    }
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
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activation Tracking</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and assist with doctor account activation
        </p>
      </div>
      
      <Card className="mb-8">
        <Card.Content className="p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Activation Summary</h3>
              <p className="mt-1 text-sm text-gray-500">
                Help your doctors activate their accounts
              </p>
            </div>
            <div className="mt-5 sm:mt-0 grid grid-cols-2 gap-6">
              <div className="text-center bg-emerald-50 rounded-lg p-4">
                <p className="text-sm font-medium text-emerald-800">Pending Activations</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">{pendingDoctors.length}</p>
              </div>
              
              <div className="text-center bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800">Activation Rate</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {rep && rep.activationStats ? rep.activationStats.rate : 0}%
                </p>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Doctors Pending Activation</h2>
        <p className="mt-1 text-sm text-gray-500">
          You can help these doctors activate their accounts through OTP verification or by resending the activation email
        </p>
      </div>
      
      {pendingDoctors.length === 0 ? (
        <Card>
          <Card.Content>
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">All doctors activated</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no doctors pending activation
              </p>
            </div>
          </Card.Content>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingDoctors.map(doctor => (
            <Card key={doctor.id} className="border border-yellow-200">
              <Card.Content>
                <div className="sm:flex sm:items-center sm:justify-between p-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                      {doctor.user.profilePicture ? (
                        <img src={doctor.user.profilePicture} alt={doctor.user.name} className="h-12 w-12 rounded-full" />
                      ) : (
                        <span className="text-gray-500 text-lg font-medium">
                          {doctor.user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{doctor.user.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {doctor.user.email}
                        </div>
                        {doctor.user.phone && (
                          <div className="flex items-center sm:ml-4 mt-1 sm:mt-0">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {doctor.user.phone}
                          </div>
                        )}
                      </div>
                      {doctor.specialty && (
                        <p className="text-sm text-gray-500 mt-1">
                          Specialty: {doctor.specialty}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0">
                    <p className="text-sm text-gray-500 mb-2">Added on {formatDate(doctor.createdAt)}</p>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendActivationEmail(doctor.id)}
                        leftIcon={<EnvelopeIcon className="h-4 w-4" />}
                      >
                        Email Activation
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleGenerateOtp(doctor)}
                        leftIcon={<QrCodeIcon className="h-4 w-4" />}
                      >
                        OTP Activation
                      </Button>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
      
      <Modal
        isOpen={isOtpModalOpen}
        onClose={() => {
          setIsOtpModalOpen(false);
          setOtp("");
          setGeneratedOtp("");
          setSelectedDoctor(null);
        }}
        title="Activate Doctor with OTP"
        size="md"
      >
        {selectedDoctor && (
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                {selectedDoctor.user.profilePicture ? (
                  <img src={selectedDoctor.user.profilePicture} alt={selectedDoctor.user.name} className="h-12 w-12 rounded-full" />
                ) : (
                  <span className="text-gray-500 text-lg font-medium">
                    {selectedDoctor.user.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedDoctor.user.name}</h3>
                <p className="text-sm text-gray-500">{selectedDoctor.user.email}</p>
              </div>
            </div>
            
            <Tab.Group>
              <Tab.List className="flex space-x-1 rounded-xl bg-blue-50 p-1">
                <Tab
                  className={({ selected }) =>
                    `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
                      selected
                        ? 'bg-white shadow'
                        : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-700'
                    }`
                  }
                >
                  OTP Verification
                </Tab>
              </Tab.List>
              <Tab.Panels className="mt-4">
                <Tab.Panel className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Generated OTP
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Share the following OTP with {selectedDoctor.user.name} to activate their account:</p>
                          <p className="font-bold text-2xl mt-2 text-center">
                            {generatedOtp}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                      Enter OTP from Doctor
                    </label>
                    <input
                      type="text"
                      id="otp"
                      className="form-input w-full"
                      placeholder="Enter the OTP provided by the doctor"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Have the doctor enter the OTP you shared with them to verify
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsOtpModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleVerifyOtp}
                      isLoading={isSubmittingOtp}
                    >
                      Verify & Activate
                    </Button>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
