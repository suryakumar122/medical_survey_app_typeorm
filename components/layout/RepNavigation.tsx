"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";
import { cn } from "@lib/utils";

const RepNavigation: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/rep" && pathname === "/rep") {
      return true;
    }
    return pathname.startsWith(path) && path !== "/rep";
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/rep",
      icon: HomeIcon,
      active: pathname === "/rep",
    },
    {
      name: "Doctors",
      href: "/rep/doctors",
      icon: UserGroupIcon,
      active: isActive("/rep/doctors"),
    },
    {
      name: "Activation Tracking",
      href: "/rep/activation",
      icon: CheckCircleIcon,
      active: isActive("/rep/activation"),
    },
    {
      name: "Profile",
      href: "/rep/profile",
      icon: UserCircleIcon,
      active: isActive("/rep/profile"),
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
              ? "bg-emerald-50 text-emerald-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            "group flex items-center px-3 py-2 text-sm font-medium rounded-md"
          )}
        >
          <item.icon
            className={cn(
              item.active
                ? "text-emerald-600"
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

export default RepNavigation;
