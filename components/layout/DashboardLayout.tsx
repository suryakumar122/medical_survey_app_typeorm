"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import DoctorNavigation from "./DoctorNavigation";
import RepNavigation from "./RepNavigation";
import ClientNavigation from "./ClientNavigation";
import AdminNavigation from "./AdminNavigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Session Expired</h1>
          <p className="mb-4">Your session has expired or you are not logged in.</p>
          <Link href="/login" className="btn-primary inline-block">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const userRole = session.user.role;
  let NavigationComponent;

  switch (userRole) {
    case "doctor":
      NavigationComponent = DoctorNavigation;
      break;
    case "representative":
      NavigationComponent = RepNavigation;
      break;
    case "client":
      NavigationComponent = ClientNavigation;
      break;
    case "admin":
      NavigationComponent = AdminNavigation;
      break;
    default:
      NavigationComponent = DoctorNavigation;
  }

  // Get the title based on the current pathname
  const getTitleFromPathname = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    
    if (segments.length === 1) {
      return `${segments[0].charAt(0).toUpperCase() + segments[0].slice(1)} Dashboard`;
    }
    
    // Format the last segment of the path
    const lastSegment = segments[segments.length - 1];
    
    // Check if it's a dynamic route parameter (has [])
    if (lastSegment.includes("[") || lastSegment.includes("]")) {
      return segments[segments.length - 2].charAt(0).toUpperCase() + segments[segments.length - 2].slice(1);
    }
    
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  const title = getTitleFromPathname(pathname);

  return (
    <div className="dashboard-container">
      <div
        className={`sidebar z-20 shadow-md transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className="text-xl font-bold text-indigo-600">Medical Survey</div>
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          <NavigationComponent />
        </div>
      </div>

      <div className="md:ml-64 flex-1 min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm h-16 flex items-center px-4 md:px-6 justify-between">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          </div>
          <div className="flex items-center">
            <div className="mr-4 text-sm text-gray-600">
              {session.user.name}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
