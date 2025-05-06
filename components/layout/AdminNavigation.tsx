"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  UserIcon,
  UserCircleIcon,
  CreditCardIcon
} from "@heroicons/react/24/outline";
import { cn } from "@lib/utils";

const AdminNavigation: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") {
      return true;
    }
    return pathname.startsWith(path) && path !== "/admin";
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: HomeIcon,
      active: pathname === "/admin",
    },
    {
      name: "Clients",
      href: "/admin/clients",
      icon: BuildingOfficeIcon,
      active: isActive("/admin/clients"),
    },
    {
      name: "Representatives",
      href: "/admin/representatives",
      icon: UserIcon,
      active: isActive("/admin/representatives"),
    },
    {
      name: "Doctors",
      href: "/admin/doctors",
      icon: UserGroupIcon,
      active: isActive("/admin/doctors"),
    },
    {
      name: "Surveys",
      href: "/admin/surveys",
      icon: ClipboardDocumentListIcon,
      active: isActive("/admin/surveys"),
    },
    {
      name: "Redemptions",
      href: "/admin/redemptions",
      icon: CreditCardIcon,
      active: isActive("/admin/redemptions"),
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: UserCircleIcon,
      active: isActive("/admin/profile"),
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
              ? "bg-gray-800 text-white"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            "group flex items-center px-3 py-2 text-sm font-medium rounded-md"
          )}
        >
          <item.icon
            className={cn(
              item.active
                ? "text-white"
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

export default AdminNavigation;
