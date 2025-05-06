"use client";

import React, { useState } from "react";
import { formatDate } from "@lib/utils";
import { CheckCircleIcon, XCircleIcon, PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { DoctorProfile } from "@types/index";
import Card from "@components/ui/Card";
import Modal from "@components/ui/Modal";
import Button from "@components/ui/Button";
import DoctorForm from "./DoctorForm";
import Link from "next/link";

interface DoctorTableProps {
  doctors: DoctorProfile[];
  role: "rep" | "client" | "admin";
  clientId?: string;
  repId?: string;
  onRefresh?: () => void;
}

const DoctorTable: React.FC<DoctorTableProps> = ({
  doctors,
  role,
  clientId,
  repId,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleEditClick = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleViewDetails = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDoctor(null);
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const searchString = searchTerm.toLowerCase();
    return (
      doctor.user.name.toLowerCase().includes(searchString) ||
      doctor.user.email.toLowerCase().includes(searchString) ||
      (doctor.specialty && doctor.specialty.toLowerCase().includes(searchString)) ||
      (doctor.hospital && doctor.hospital.toLowerCase().includes(searchString))
    );
  });

  const statusLabel = (status: string) => {
    const statusMap: Record<string, { color: string; label: string; icon: JSX.Element }> = {
      active: {
        color: "bg-green-100 text-green-800",
        label: "Active",
        icon: <CheckCircleIcon className="h-5 w-5 mr-1" />,
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending",
        icon: <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      },
      inactive: {
        color: "bg-gray-100 text-gray-800",
        label: "Inactive",
        icon: <XCircleIcon className="h-5 w-5 mr-1" />,
      },
      suspended: {
        color: "bg-red-100 text-red-800",
        label: "Suspended",
        icon: <XCircleIcon className="h-5 w-5 mr-1" />,
      },
    };

    const statusInfo = statusMap[status] || statusMap.inactive;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
      >
        {statusInfo.icon}
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input w-full md:w-72"
        />
      </div>

      <Card>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialty
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No doctors found
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                            {doctor.user.profilePicture ? (
                              <img
                                src={doctor.user.profilePicture}
                                alt={doctor.user.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              doctor.user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {doctor.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {doctor.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doctor.specialty || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doctor.hospital || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {statusLabel(doctor.user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium">
                            {doctor.totalPoints - doctor.redeemedPoints}
                          </span>
                          <span className="text-xs text-gray-500">
                            of {doctor.totalPoints} total
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(doctor.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(doctor)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {(role === "client" || role === "admin") && (
                          <button
                            onClick={() => handleEditClick(doctor)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>

      {/* Edit Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Edit Doctor"
        size="lg"
      >
        {selectedDoctor && (
          <DoctorForm
            doctor={selectedDoctor}
            clientId={clientId}
            repId={repId}
            onSuccess={() => {
              handleCloseModal();
              if (onRefresh) onRefresh();
            }}
          />
        )}
      </Modal>

      {/* Doctor Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title="Doctor Details"
        size="lg"
      >
        {selectedDoctor && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl">
                {selectedDoctor.user.profilePicture ? (
                  <img
                    src={selectedDoctor.user.profilePicture}
                    alt={selectedDoctor.user.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  selectedDoctor.user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedDoctor.user.name}
                </h3>
                <p className="text-sm text-gray-500">{selectedDoctor.user.email}</p>
                <div className="mt-1">{statusLabel(selectedDoctor.user.status)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h4>
                <p className="text-sm">
                  <span className="font-medium">Email: </span>
                  {selectedDoctor.user.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Phone: </span>
                  {selectedDoctor.user.phone || "Not provided"}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Professional Details</h4>
                <p className="text-sm">
                  <span className="font-medium">Specialty: </span>
                  {selectedDoctor.specialty || "Not specified"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Hospital: </span>
                  {selectedDoctor.hospital || "Not specified"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Points Summary</h4>
              <div className="bg-gray-50 p-4 rounded-md flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Points Earned</p>
                  <p className="text-lg font-medium">{selectedDoctor.totalPoints}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Points Redeemed</p>
                  <p className="text-lg font-medium">{selectedDoctor.redeemedPoints}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available Points</p>
                  <p className="text-lg font-medium text-green-600">
                    {selectedDoctor.totalPoints - selectedDoctor.redeemedPoints}
                  </p>
                </div>
              </div>
            </div>

            {selectedDoctor.bio && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Bio</h4>
                <p className="text-sm text-gray-700">{selectedDoctor.bio}</p>
              </div>
            )}

            {/* Additional actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleCloseDetailModal}
              >
                Close
              </Button>
              {(role === "client" || role === "admin") && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleCloseDetailModal();
                    handleEditClick(selectedDoctor);
                  }}
                >
                  Edit Doctor
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorTable;
