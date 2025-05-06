"use client";

import React, { useState } from "react";
import { CloudArrowUpIcon, DocumentTextIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";
import Modal from "@components/ui/Modal";
import toast from "react-hot-toast";

interface CSVUploadProps {
  clientId: string;
  onUploadSuccess: () => void;
}

const CSVUpload: React.FC<CSVUploadProps> = ({ clientId, onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFile = (file: File) => {
    // Check if file is a CSV
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setFile(file);

    // Read file for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const content = e.target.result as string;
        const rows = content.split("\n").map((row) => {
          // Handle quoted fields with commas
          const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          if (matches) {
            return matches.map(m => m.replace(/^"|"$/g, ''));
          }
          return row.split(",");
        });
        
        setPreviewData(rows.slice(0, 6)); // Preview first 6 rows
        setIsPreviewModalOpen(true);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setIsPreviewModalOpen(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientId", clientId);

      const response = await fetch("/api/doctors/csv-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload CSV");
      }

      const result = await response.json();
      setUploadResult(result.data);
      setIsResultModalOpen(true);

      if (result.data.success > 0) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast.error((error as Error).message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    setUploadResult(null);
    setFile(null);
  };

  return (
    <div>
      <Card className={`${isDragging ? "border-2 border-dashed border-blue-400" : ""}`}>
        <Card.Content>
          <div
            className="flex flex-col items-center justify-center p-8 text-center"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Doctor Data
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop your CSV file here, or click to browse
            </p>
            <input
              type="file"
              id="csv-upload"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="csv-upload">
              <Button
                variant="outline"
                type="button"
                className="cursor-pointer"
              >
                Select CSV File
              </Button>
            </label>

            {file && (
              <div className="mt-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">CSV Format</h3>
        <p className="text-sm text-gray-500 mb-4">
          Your CSV file should have the following columns:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Column
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Required
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  name
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  Yes
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  Full name of the doctor
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  email
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  Yes
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  Email address (must be unique)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  phone
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  No
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  Phone number
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  specialty
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  No
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  Medical specialty
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  hospital
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  No
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  Hospital or clinic name
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  repEmail
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  No
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  Email of the representative to assign
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Preview CSV Data"
        size="lg"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {previewData.length > 0 && (
                <tr>
                  {previewData[0].map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {previewData.slice(1, 6).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-3 py-2 whitespace-nowrap text-sm text-gray-500"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            isLoading={isUploading}
          >
            Upload CSV
          </Button>
        </div>
      </Modal>

      {/* Result Modal */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={handleCloseResultModal}
        title="Upload Results"
        size="lg"
      >
        {uploadResult && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 p-4 rounded-md">
                <h4 className="text-green-800 font-medium">Successful</h4>
                <p className="text-2xl font-bold text-green-600">
                  {uploadResult.success}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-md">
                <h4 className="text-red-800 font-medium">Failed</h4>
                <p className="text-2xl font-bold text-red-600">
                  {uploadResult.failed}
                </p>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-red-800 font-medium flex items-center">
                  <ExclamationCircleIcon className="w-5 h-5 mr-1" />
                  Errors
                </h4>
                <div className="bg-red-50 p-4 rounded-md mt-2 max-h-60 overflow-y-auto">
                  <ul className="list-disc list-inside space-y-1">
                    {uploadResult.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                onClick={handleCloseResultModal}
              >
                {uploadResult.success > 0 ? "View Doctors" : "Try Again"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CSVUpload;
