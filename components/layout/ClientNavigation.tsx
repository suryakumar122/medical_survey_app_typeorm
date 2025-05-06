"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  UserIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";
import { cn } from "@lib/utils";

const ClientNavigation: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/client" && pathname === "/client") {
      return true;
    }
    return pathname.startsWith(path) && path !== "/client";
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/client",
      icon: HomeIcon,
      active: pathname === "/client",
    },
    {
      name: "Analytics",
      href: "/client/analytics",
      icon: ChartBarIcon,
      active: isActive("/client/analytics"),
    },
    {
      name: "Doctors",
      href: "/client/doctors",
      icon: UserGroupIcon,
      active: isActive("/client/doctors"),
    },
    {
      name: "Representatives",
      href: "/client/representatives",
      icon: UserIcon,
      active: isActive("/client/representatives"),
    },
    {
      name: "Surveys",
      href: "/client/surveys",
      icon: ClipboardDocumentListIcon,
      active: isActive("/client/surveys"),
    },
    {
      name: "Profile",
      href: "/client/profile",
      icon: UserCircleIcon,
      active: isActive("/client/profile"),
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
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            "group flex items-center px-3 py-2 text-sm font-medium rounded-md"
          )}
        >
          <item.icon
            className={cn(
              item.active
                ? "text-blue-600"
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

export default ClientNavigation;
