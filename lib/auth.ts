import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

// Mock users for development and testing
const MOCK_USERS = {
  doctor: {
    id: "doctor-1",
    email: "doctor@example.com",
    name: "Dr. John Smith",
    password: "$2a$12$8vxYfAWyVg.uGgylpZmQO.QCi1l.4JRjw.9XUYWf9iZLOMJVVPRZG", // doctorpass
    role: "doctor",
    status: "active",
  },
  rep: {
    id: "rep-1",
    email: "rep@example.com",
    name: "Jane Rep",
    password: "$2a$12$8vxYfAWyVg.uGgylpZmQO.QCi1l.4JRjw.9XUYWf9iZLOMJVVPRZG", // reppass
    role: "representative",
    status: "active",
  },
  client: {
    id: "client-1",
    email: "client@example.com",
    name: "Acme Pharmaceuticals",
    password: "$2a$12$8vxYfAWyVg.uGgylpZmQO.QCi1l.4JRjw.9XUYWf9iZLOMJVVPRZG", // clientpass
    role: "client",
    status: "active",
  },
  admin: {
    id: "admin-1",
    email: "admin@example.com",
    name: "Admin User",
    password: "$2a$12$8vxYfAWyVg.uGgylpZmQO.QCi1l.4JRjw.9XUYWf9iZLOMJVVPRZG", // adminpass
    role: "admin",
    status: "active",
  }
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
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
          console.error("Missing credentials");
          return null;
        }
        
        // For development/testing, use mock users
        const email = credentials.email.toLowerCase();
        
        // Match the email with our mock users
        let mockUser = null;
        
        if (email === MOCK_USERS.doctor.email) {
          mockUser = MOCK_USERS.doctor;
        } else if (email === MOCK_USERS.client.email) {
          mockUser = MOCK_USERS.client;
        } else if (email === MOCK_USERS.rep.email) {
          mockUser = MOCK_USERS.rep;
        } else if (email === MOCK_USERS.admin.email) {
          mockUser = MOCK_USERS.admin;
        }
        
        if (mockUser) {
          try {
            const isValid = await compare(credentials.password, mockUser.password);
            
            if (!isValid) {
              console.error("Invalid password for mock user");
              return null;
            }
            
            return {
              id: mockUser.id,
              email: mockUser.email,
              name: mockUser.name,
              role: mockUser.role,
            };
          } catch (error) {
            console.error("Error comparing passwords:", error);
            return null;
          }
        }
        
        // If not a mock user, return null for now
        // In a real app, you would query the database here
        console.error("User not found:", email);
        return null;
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
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