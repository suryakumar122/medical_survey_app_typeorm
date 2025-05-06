"use client";

import React from "react";
import { cn } from "@lib/utils";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

const Form: React.FC<FormProps> = ({ children, className, ...props }) => {
  return (
    <form className={cn("space-y-6", className)} {...props}>
      {children}
    </form>
  );
};

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn("pb-6", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

const FormRow: React.FC<FormRowProps> = ({ children, className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {children}
    </div>
  );
};

interface FormSubmitProps {
  children: React.ReactNode;
  className?: string;
}

const FormSubmit: React.FC<FormSubmitProps> = ({ children, className }) => {
  return (
    <div className={cn("pt-4 flex justify-end", className)}>
      {children}
    </div>
  );
};

Form.Section = FormSection;
Form.Row = FormRow;
Form.Submit = FormSubmit;

export default Form;
