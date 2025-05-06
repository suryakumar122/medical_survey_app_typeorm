import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { storage } from "../server/storage";

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
          throw new Error("Invalid credentials");
        }

        // Use the Drizzle storage implementation
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
