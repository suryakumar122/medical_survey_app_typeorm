"use client";

import React from "react";
import { cn } from "@lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn("card", className)}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)}>
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn("mt-4 pt-4 border-t border-gray-200", className)}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
