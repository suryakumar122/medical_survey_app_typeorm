"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  UserCircleIcon, 
  CreditCardIcon 
} from "@heroicons/react/24/outline";
import { cn } from "@lib/utils";

const DoctorNavigation: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/doctor" && pathname === "/doctor") {
      return true;
    }
    return pathname.startsWith(path) && path !== "/doctor";
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/doctor",
      icon: HomeIcon,
      active: pathname === "/doctor",
    },
    {
      name: "Surveys",
      href: "/doctor/surveys",
      icon: ClipboardDocumentListIcon,
      active: isActive("/doctor/surveys"),
    },
    {
      name: "Points & Redemption",
      href: "/doctor/points",
      icon: CreditCardIcon,
      active: isActive("/doctor/points"),
    },
    {
      name: "Profile",
      href: "/doctor/profile",
      icon: UserCircleIcon,
      active: isActive("/doctor/profile"),
    },
  ];

  return (
    <nav className="space-y-1">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            item.active
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            "group flex items-center px-3 py-2 text-sm font-medium rounded-md"
          )}
        >
          <item.icon
            className={cn(
              item.active
                ? "text-indigo-600"
                : "text-gray-400 group-hover:text-gray-500",
              "mr-3 flex-shrink-0 h-6 w-6"
            )}
            aria-hidden="true"
          />
          {item.name}
        </Link>
      ))}
    </nav>
  );
};

export default DoctorNavigation;
