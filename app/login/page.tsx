"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to doctor login by default
    router.push("/login/doctor");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md px-4 py-8 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Select Login Type</h1>
        
        <div className="space-y-4">
          <Link 
            href="/login/doctor" 
            className="block w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium text-center rounded-md transition-colors"
          >
            Doctor Login
          </Link>
          
          <Link 
            href="/login/rep" 
            className="block w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-center rounded-md transition-colors"
          >
            Representative Login
          </Link>
          
          <Link 
            href="/login/client" 
            className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-center rounded-md transition-colors"
          >
            Client Login
          </Link>
          
          <Link 
            href="/login/admin" 
            className="block w-full py-3 px-4 bg-gray-700 hover:bg-gray-800 text-white font-medium text-center rounded-md transition-colors"
          >
            Admin Login
          </Link>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
