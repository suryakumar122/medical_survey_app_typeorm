import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { storage } from "../server/storage";

// Mock users for development and testing
const MOCK_USERS = {
  doctor: {
    id: "1",
    email: "doctor@example.com",
    name: "Dr. John Smith",
    password: "$2b$10$Qa7/37sJ4IVWPGg6qgXDBeLz3b3TE4SviBggXzFTrUhftRjb4KPY6", // Password: doctorpass
    role: "doctor",
    status: "active",
    profilePicture: null,
    specialty: "Cardiology",
    hospital: "City General Hospital"
  },
  client: {
    id: "2",
    email: "client@example.com",
    name: "Acme Pharmaceuticals",
    password: "$2a$10$KxwB2vZ.I0hXFT7fMXDxKeUOTa8r/1q1NfnjyEbfgJ7C0xWsPV04.", // Password: clientpass
    role: "client",
    status: "active",
    profilePicture: null
  }
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("credentials", credentials);
          throw new Error("Invalid credentials");
        }
        
        // For development, check if the email matches one of our mock users first
        let mockUser = null;
        if (credentials.email === MOCK_USERS.doctor.email) {
          mockUser = MOCK_USERS.doctor;
        } else if (credentials.email === MOCK_USERS.client.email) {
          mockUser = MOCK_USERS.client;
        }
        
        if (mockUser) {
          // Use mock user for testing
          const isValid = await compare(credentials.password, mockUser.password);
          
          if (!isValid) {
            throw new Error("Invalid password");
          }
          
          return {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role,
          };
        }
        
        // If not a mock user, try using the Drizzle storage implementation
        try {
          const user = await storage.getUserByUsername(credentials.email);
          
          if (!user || !user.password) {
            throw new Error("User not found");
          }
          
          if (user.status !== "active") {
            throw new Error("User account is not active");
          }
          
          const isValid = await compare(credentials.password, user.password);
          
          if (!isValid) {
            throw new Error("Invalid password");
          }
          
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Database authentication error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

// Helper functions
export const isDoctor = (role: string): boolean => role === "doctor";
export const isRep = (role: string): boolean => role === "representative";
export const isClient = (role: string): boolean => role === "client";
export const isAdmin = (role: string): boolean => role === "admin";

export const getRoleRedirectPath = (role: string): string => {
  if (isDoctor(role)) return "/doctor";
  if (isRep(role)) return "/rep";
  if (isClient(role)) return "/client";
  if (isAdmin(role)) return "/admin";
  return "/";
};
