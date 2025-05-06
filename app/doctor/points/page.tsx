"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/layout/DashboardLayout";
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";
import PointsCard from "@components/points/PointsCard";
import RedemptionForm from "@components/points/RedemptionForm";
import Modal from "@components/ui/Modal";
import { formatDate } from "@lib/utils";

interface Doctor {
  id: string;
  totalPoints: number;
  redeemedPoints: number;
}

interface Redemption {
  id: string;
  points: number;
  redemptionType: string;
  redemptionDetails: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function DoctorPoints() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session.user.role !== "doctor") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, session, router]);
  
  const fetchData = async () => {
    try {
      // Fetch doctor profile
      const profileResponse = await fetch("/api/doctors/profile");
      if (!profileResponse.ok) {
        throw new Error("Failed to fetch doctor profile");
      }
      const profileData = await profileResponse.json();
      setDoctor(profileData.data);
      
      // Fetch redemption history
      const redemptionsResponse = await fetch("/api/redemptions");
      if (!redemptionsResponse.ok) {
        throw new Error("Failed to fetch redemptions");
      }
      const redemptionsData = await redemptionsResponse.json();
      setRedemptions(redemptionsData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRedemptionSuccess = () => {
    setIsRedeemModalOpen(false);
    fetchData();
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
  
  if (!doctor) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-800">
            Unable to load your points information
          </h2>
          <p className="mt-2 text-gray-600">
            Please try again later or contact support
          </p>
        </div>
      </DashboardLayout>
    );
  }
  
  const availablePoints = doctor.totalPoints - doctor.redeemedPoints;
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Points & Redemption</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your points and redeem rewards
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <PointsCard 
          title="Available Points" 
          points={availablePoints} 
          description="Points available for redemption"
          className="border-l-4 border-green-500"
        />
        
        <PointsCard 
          title="Total Points Earned" 
          points={doctor.totalPoints} 
          description="Total points from all surveys"
          className="border-l-4 border-blue-500"
        />
        
        <PointsCard 
          title="Points Redeemed" 
          points={doctor.redeemedPoints} 
          description="Points already redeemed"
          className="border-l-4 border-purple-500"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <Card.Header 
              title="Redemption History" 
              description="Track the status of your redemption requests"
            />
            <Card.Content>
              {redemptions.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No redemptions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't redeemed any points yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {redemptions.map((redemption) => (
                        <tr key={redemption.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(redemption.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {redemption.points}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {redemption.redemptionType === "upi" ? "UPI Transfer" : "Amazon Gift Card"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {redemption.redemptionType === "upi" 
                              ? redemption.redemptionDetails.upiId 
                              : redemption.redemptionDetails.amazonEmail}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              redemption.status === "completed" 
                                ? "bg-green-100 text-green-800" 
                                : redemption.status === "rejected" 
                                  ? "bg-red-100 text-red-800" 
                                  : redemption.status === "processing" 
                                    ? "bg-blue-100 text-blue-800" 
                                    : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
        
        <div>
          <Card>
            <Card.Header 
              title="Redeem Points" 
              description="Convert your points into rewards"
            />
            <Card.Content>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  You have <span className="font-bold text-green-600">{availablePoints}</span> points available for redemption.
                </p>
                
                <Button 
                  variant="primary" 
                  disabled={availablePoints < 500}
                  onClick={() => setIsRedeemModalOpen(true)}
                  className="w-full"
                >
                  Redeem Points
                </Button>
                
                {availablePoints < 500 && (
                  <p className="text-xs text-red-500">
                    You need at least 500 points to redeem
                  </p>
                )}
                
                <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm">
                  <h4 className="font-medium text-gray-700 mb-2">Redemption Options</h4>
                  <ul className="space-y-2 text-left">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">UPI Transfer to your account</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">Amazon Gift Cards sent to your email</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card.Content>
          </Card>
          
          <Card className="mt-6">
            <Card.Header 
              title="Points Conversion" 
              description="How your points translate to rewards"
            />
            <Card.Content>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                  <div className="font-medium text-blue-800">500 Points</div>
                  <div className="text-gray-500">=</div>
                  <div className="font-medium text-green-700">₹250</div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                  <div className="font-medium text-blue-800">1000 Points</div>
                  <div className="text-gray-500">=</div>
                  <div className="font-medium text-green-700">₹500</div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                  <div className="font-medium text-blue-800">2000 Points</div>
                  <div className="text-gray-500">=</div>
                  <div className="font-medium text-green-700">₹1000</div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
      
      <Modal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        title="Redeem Points"
        size="md"
      >
        <RedemptionForm 
          availablePoints={availablePoints} 
          doctorId={doctor.id}
          onSuccess={handleRedemptionSuccess}
          onCancel={() => setIsRedeemModalOpen(false)}
        />
      </Modal>
    </DashboardLayout>
  );
}
