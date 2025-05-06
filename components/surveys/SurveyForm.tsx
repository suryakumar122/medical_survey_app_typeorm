"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { SurveyFull, QuestionResponse } from "@types/index";
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";
import toast from "react-hot-toast";

interface SurveyFormProps {
  survey: SurveyFull;
  doctorId: string;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ survey, doctorId }) => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sort questions by orderIndex
  const sortedQuestions = [...survey.questions].sort((a, b) => a.orderIndex - b.orderIndex);
  const currentQuestion = sortedQuestions[currentQuestionIndex];

  const handleNext = () => {
    // Validate if the current question is required
    if (currentQuestion.required && !responses[currentQuestion.id]) {
      toast.error("This question is required");
      return;
    }

    if (currentQuestionIndex < sortedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate if the current question is required
    if (currentQuestion.required && !responses[currentQuestion.id]) {
      toast.error("This question is required");
      return;
    }

    // Check if all required questions have been answered
    const unansweredRequired = sortedQuestions
      .filter((q) => q.required)
      .filter((q) => !responses[q.id]);

    if (unansweredRequired.length > 0) {
      toast.error("Please answer all required questions");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format responses for API
      const formattedResponses = Object.entries(responses).map(([questionId, responseData]) => ({
        questionId,
        responseData,
      }));

      const response = await fetch(`/api/surveys/${survey.id}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId,
          responses: formattedResponses,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }

      toast.success("Survey submitted successfully!");
      router.push("/doctor/surveys?submitted=true");
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast.error((error as Error).message || "Failed to submit survey");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionType = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.questionType) {
      case "text":
        return (
          <div>
            <textarea
              className="form-input h-24"
              placeholder="Your answer"
              value={(responses[currentQuestion.id]?.text as string) || ""}
              onChange={(e) =>
                handleResponseChange(currentQuestion.id, { text: e.target.value })
              }
            />
          </div>
        );
      case "likert":
        const scale = currentQuestion.options?.scale || 5;
        return (
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">
                {currentQuestion.options?.low || "Strongly Disagree"}
              </span>
              <span className="text-sm text-gray-500">
                {currentQuestion.options?.high || "Strongly Agree"}
              </span>
            </div>
            <div className="flex justify-between">
              {Array.from({ length: scale }, (_, i) => i + 1).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`w-10 h-10 rounded-full border ${
                    responses[currentQuestion.id]?.value === value
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-300 hover:border-indigo-500"
                  }`}
                  onClick={() =>
                    handleResponseChange(currentQuestion.id, { value })
                  }
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        );
      case "multipleChoice":
        return (
          <div className="space-y-2">
            {currentQuestion.options?.choices?.map((choice: any, index: number) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`choice-${index}`}
                  name={currentQuestion.id}
                  checked={responses[currentQuestion.id]?.value === choice}
                  onChange={() =>
                    handleResponseChange(currentQuestion.id, { value: choice })
                  }
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <label
                  htmlFor={`choice-${index}`}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {choice}
                </label>
              </div>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {currentQuestion.options?.choices?.map((choice: any, index: number) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`checkbox-${index}`}
                  checked={
                    responses[currentQuestion.id]?.values?.includes(choice) || false
                  }
                  onChange={(e) => {
                    const currentValues = responses[currentQuestion.id]?.values || [];
                    let newValues;
                    if (e.target.checked) {
                      newValues = [...currentValues, choice];
                    } else {
                      newValues = currentValues.filter((v: string) => v !== choice);
                    }
                    handleResponseChange(currentQuestion.id, { values: newValues });
                  }}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor={`checkbox-${index}`}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {choice}
                </label>
              </div>
            ))}
          </div>
        );
      case "ranking":
        const items = currentQuestion.options?.items || [];
        const currentRanking = responses[currentQuestion.id]?.ranking || [...items];

        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-2">
              Drag items to change their order (1 = highest rank)
            </p>
            <div className="space-y-2">
              {currentRanking.map((item: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center p-2 border border-gray-200 bg-white rounded-md"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full mr-2">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                  <div className="ml-auto space-x-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        const newRanking = [...currentRanking];
                        [newRanking[index - 1], newRanking[index]] = [
                          newRanking[index],
                          newRanking[index - 1],
                        ];
                        handleResponseChange(currentQuestion.id, {
                          ranking: newRanking,
                        });
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === currentRanking.length - 1}
                      onClick={() => {
                        const newRanking = [...currentRanking];
                        [newRanking[index], newRanking[index + 1]] = [
                          newRanking[index + 1],
                          newRanking[index],
                        ];
                        handleResponseChange(currentQuestion.id, {
                          ranking: newRanking,
                        });
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "matrix":
        const rows = currentQuestion.options?.rows || [];
        const columns = currentQuestion.options?.columns || [];
        const matrix = responses[currentQuestion.id]?.matrix || {};

        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  {columns.map((col: string, colIndex: number) => (
                    <th
                      key={colIndex}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row: string, rowIndex: number) => (
                  <tr key={rowIndex}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row}
                    </td>
                    {columns.map((col: string, colIndex: number) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="radio"
                          name={`matrix-${rowIndex}`}
                          checked={matrix[row] === col}
                          onChange={() => {
                            const newMatrix = { ...matrix, [row]: col };
                            handleResponseChange(currentQuestion.id, {
                              matrix: newMatrix,
                            });
                          }}
                          className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return <div>Unsupported question type</div>;
    }
  };

  // Initialize ranking if needed
  useEffect(() => {
    if (
      currentQuestion?.questionType === "ranking" &&
      currentQuestion.options?.items &&
      !responses[currentQuestion.id]
    ) {
      handleResponseChange(currentQuestion.id, {
        ranking: [...currentQuestion.options.items],
      });
    }
  }, [currentQuestion]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
        <div className="points-badge">
          {survey.points} points
        </div>
      </div>

      {survey.description && (
        <p className="mb-8 text-gray-600">{survey.description}</p>
      )}

      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {sortedQuestions.length}
        </div>
        <div className="text-sm text-gray-500">
          {currentQuestion.required ? (
            <span className="text-red-500">* Required</span>
          ) : (
            "Optional"
          )}
        </div>
      </div>

      <Card className="mb-6">
        <Card.Content>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {currentQuestion.questionText}
          </h3>
          {renderQuestionType()}
        </Card.Content>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          leftIcon={<ChevronLeftIcon className="h-5 w-5" />}
        >
          Previous
        </Button>

        {currentQuestionIndex < sortedQuestions.length - 1 ? (
          <Button
            variant="primary"
            onClick={handleNext}
            rightIcon={<ArrowRightIcon className="h-5 w-5" />}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Submit Survey
          </Button>
        )}
      </div>

      <div className="mt-8 w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full"
          style={{
            width: `${
              ((currentQuestionIndex + 1) / sortedQuestions.length) * 100
            }%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default SurveyForm;
