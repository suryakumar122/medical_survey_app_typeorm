import { NextRequest } from "next/server";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// Extended types for NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Doctor types
export interface DoctorProfile {
  id: string;
  userId: string;
  specialty: string;
  hospital: string;
  bio: string;
  totalPoints: number;
  redeemedPoints: number;
  user: {
    name: string;
    email: string;
    phone: string;
    profilePicture: string;
    status: string;
  };
}

// Representative types
export interface RepresentativeProfile {
  id: string;
  userId: string;
  clientId: string;
  region: string;
  territory: string;
  user: {
    name: string;
    email: string;
    phone: string;
    profilePicture: string;
    status: string;
  };
  client: {
    id: string;
    companyName: string;
  };
}

// Client types
export interface ClientProfile {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  user: {
    name: string;
    email: string;
    phone: string;
    profilePicture: string;
    status: string;
  };
}

// Survey types
export interface SurveyBasic {
  id: string;
  title: string;
  description: string;
  points: number;
  estimatedTime: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyFull extends SurveyBasic {
  clientId: string;
  client: {
    id: string;
    companyName: string;
  };
  questions: SurveyQuestion[];
  startsAt: Date | null;
  endsAt: Date | null;
  targetSpecialty: string | null;
}

export interface SurveyQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: any;
  required: boolean;
  orderIndex: number;
  conditionalLogic: any;
}

export interface SurveyResponse {
  id: string;
  doctorId: string;
  surveyId: string;
  completed: boolean;
  pointsEarned: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  questionResponses: QuestionResponse[];
}

export interface QuestionResponse {
  id: string;
  questionId: string;
  responseData: any;
}

// Redemption types
export interface RedemptionRequest {
  doctorId: string;
  points: number;
  redemptionType: "upi" | "amazon";
  redemptionDetails: {
    upiId?: string;
    amazonEmail?: string;
  };
}

export interface Redemption {
  id: string;
  doctorId: string;
  points: number;
  redemptionType: "upi" | "amazon";
  redemptionDetails: any;
  status: "pending" | "processing" | "completed" | "rejected";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface AuthRequest extends NextRequest {
  auth?: JWT | null;
}

export interface UserRegistration {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "doctor" | "representative" | "client" | "admin";
}

export interface DoctorRegistration extends UserRegistration {
  specialty?: string;
  hospital?: string;
  repId?: string;
  clientId?: string;
}

export interface RepresentativeRegistration extends UserRegistration {
  clientId: string;
  region?: string;
  territory?: string;
}

export interface ClientRegistration extends UserRegistration {
  companyName: string;
  industry?: string;
  contactPerson?: string;
  contactPhone?: string;
  address?: string;
}

// CSV Upload types
export interface CSVDoctor {
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  hospital?: string;
  repEmail?: string;
}
