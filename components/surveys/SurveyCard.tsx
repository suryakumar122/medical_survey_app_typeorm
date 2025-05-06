"use client";

import React from "react";
import Link from "next/link";
import { ClockIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { formatDate } from "@lib/utils";
import { SurveyBasic } from "@types/index";
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";

interface SurveyCardProps {
  survey: SurveyBasic;
  role: "doctor" | "client" | "admin";
  buttonText?: string;
  completed?: boolean;
  completedAt?: Date;
}

const SurveyCard: React.FC<SurveyCardProps> = ({
  survey,
  role,
  buttonText = "View",
  completed = false,
  completedAt,
}) => {
  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusColors[status as keyof typeof statusColors] || "bg-gray-100"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getBasePath = () => {
    switch (role) {
      case "doctor":
        return "/doctor/surveys";
      case "client":
        return "/client/surveys";
      case "admin":
        return "/admin/surveys";
      default:
        return "/surveys";
    }
  };

  return (
    <Card className="survey-card hover:shadow-lg transition-shadow">
      <Card.Header
        title={survey.title}
        description={survey.description || ""}
        action={
          role !== "doctor" ? getStatusBadge(survey.status) : (
            completed ? (
              <span className="points-badge">
                Earned {survey.points} points
              </span>
            ) : (
              <span className="points-badge">
                {survey.points} points
              </span>
            )
          )
        }
      />
      <Card.Content>
        <div className="mt-2 flex flex-col space-y-3">
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <span>
              Estimated time: {survey.estimatedTime} {survey.estimatedTime === 1 ? "minute" : "minutes"}
            </span>
          </div>
          {completed && completedAt && (
            <div className="flex items-center text-sm text-gray-500">
              <ChartBarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>Completed on {formatDate(completedAt)}</span>
            </div>
          )}
        </div>
      </Card.Content>
      <Card.Footer className="flex justify-end">
        <Link href={`${getBasePath()}/${survey.id}`}>
          <Button 
            variant={role === "doctor" ? "primary" : (role === "client" ? "secondary" : "outline")}
          >
            {buttonText}
          </Button>
        </Link>
      </Card.Footer>
    </Card>
  );
};

export default SurveyCard;
