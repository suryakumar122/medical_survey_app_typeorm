"use client";

import React, { useState, useEffect } from "react";
import { DoctorProfile } from "@types/index";
import Form from "@components/ui/Form";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";
import toast from "react-hot-toast";

interface DoctorFormProps {
  doctor?: DoctorProfile;
  clientId?: string;
  repId?: string;
  onSuccess?: () => void;
}

const DoctorForm: React.FC<DoctorFormProps> = ({
  doctor,
  clientId,
  repId,
  onSuccess,
}) => {
  const isEditing = !!doctor;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: doctor?.user.name || "",
    email: doctor?.user.email || "",
    phone: doctor?.user.phone || "",
    specialty: doctor?.specialty || "",
    hospital: doctor?.hospital || "",
    bio: doctor?.bio || "",
    status: doctor?.user.status || "pending",
    password: "",
    confirmPassword: "",
  });
  const [reps, setReps] = useState([]);
  const [selectedRepId, setSelectedRepId] = useState(repId || "");

  // Fetch representatives if clientId is provided
  useEffect(() => {
    if (clientId) {
      const fetchReps = async () => {
        try {
          const response = await fetch(`/api/representatives?clientId=${clientId}`);
          if (response.ok) {
            const data = await response.json();
            setReps(data.data);
          }
        } catch (error) {
          console.error("Error fetching representatives:", error);
        }
      };

      fetchReps();
    }
  }, [clientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!isEditing && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = isEditing ? `/api/doctors/${doctor.id}` : "/api/doctors";
      const method = isEditing ? "PUT" : "POST";

      const requestData = {
        ...formData,
        clientId,
        repId: selectedRepId || undefined,
      };

      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "An error occurred");
      }

      toast.success(
        isEditing ? "Doctor updated successfully" : "Doctor created successfully"
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving doctor:", error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Section title="Basic Information">
        <Form.Row>
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isEditing}
          />
        </Form.Row>

        <Form.Row>
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label="Specialty"
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
          />
        </Form.Row>

        <Input
          label="Hospital"
          name="hospital"
          value={formData.hospital}
          onChange={handleChange}
        />

        <Input
          label="Bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          as="textarea"
          rows={3}
        />
      </Form.Section>

      {clientId && (
        <Form.Section title="Assignment">
          <div className="mb-4">
            <label htmlFor="repId" className="form-label">
              Assign to Representative
            </label>
            <select
              id="repId"
              value={selectedRepId}
              onChange={(e) => setSelectedRepId(e.target.value)}
              className="form-input"
            >
              <option value="">None</option>
              {reps.map((rep: any) => (
                <option key={rep.id} value={rep.id}>
                  {rep.user.name} ({rep.user.email})
                </option>
              ))}
            </select>
          </div>
        </Form.Section>
      )}

      {isEditing && (
        <Form.Section title="Account Status">
          <div className="mb-4">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-input"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </Form.Section>
      )}

      {!isEditing && (
        <Form.Section title="Password">
          <Form.Row>
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </Form.Row>
        </Form.Section>
      )}

      <Form.Submit>
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          className="mr-2"
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEditing ? "Update Doctor" : "Create Doctor"}
        </Button>
      </Form.Submit>
    </Form>
  );
};

export default DoctorForm;
