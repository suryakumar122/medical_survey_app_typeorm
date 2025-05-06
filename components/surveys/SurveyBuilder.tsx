"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Form from "@components/ui/Form";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";
import Card from "@components/ui/Card";
import toast from "react-hot-toast";

interface SurveyBuilderProps {
  clientId: string;
  editSurvey?: any;
}

const SurveyBuilder: React.FC<SurveyBuilderProps> = ({ clientId, editSurvey }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(editSurvey?.title || "");
  const [description, setDescription] = useState(editSurvey?.description || "");
  const [points, setPoints] = useState(editSurvey?.points?.toString() || "10");
  const [estimatedTime, setEstimatedTime] = useState(editSurvey?.estimatedTime?.toString() || "5");
  const [targetSpecialty, setTargetSpecialty] = useState(editSurvey?.targetSpecialty || "");
  const [status, setStatus] = useState(editSurvey?.status || "draft");
  const [questions, setQuestions] = useState(
    editSurvey?.questions?.length
      ? editSurvey.questions.sort((a: any, b: any) => a.orderIndex - b.orderIndex)
      : [
          {
            id: Date.now().toString(),
            questionText: "",
            questionType: "text",
            required: true,
            options: null,
          },
        ]
  );

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        questionText: "",
        questionType: "text",
        required: true,
        options: null,
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error("Survey must have at least one question");
      return;
    }
    
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };

    // Reset options when question type changes
    if (field === "questionType") {
      newQuestions[index].options = getDefaultOptionsForType(value);
    }

    setQuestions(newQuestions);
  };

  const getDefaultOptionsForType = (type: string) => {
    switch (type) {
      case "likert":
        return { scale: 5, low: "Strongly Disagree", high: "Strongly Agree" };
      case "multipleChoice":
        return { choices: ["Option 1", "Option 2", "Option 3"] };
      case "checkbox":
        return { choices: ["Option 1", "Option 2", "Option 3"] };
      case "ranking":
        return { items: ["Item 1", "Item 2", "Item 3"] };
      case "matrix":
        return {
          rows: ["Row 1", "Row 2", "Row 3"],
          columns: ["Column 1", "Column 2", "Column 3"],
        };
      default:
        return null;
    }
  };

  const handleOptionsChange = (index: number, optionsField: string, value: any) => {
    const newQuestions = [...questions];
    
    if (!newQuestions[index].options) {
      newQuestions[index].options = {};
    }
    
    newQuestions[index].options = {
      ...newQuestions[index].options,
      [optionsField]: value,
    };
    
    setQuestions(newQuestions);
  };

  const handleChoiceChange = (
    questionIndex: number,
    choiceIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    const choices = [...(newQuestions[questionIndex].options?.choices || [])];
    choices[choiceIndex] = value;
    
    newQuestions[questionIndex].options = {
      ...newQuestions[questionIndex].options,
      choices,
    };
    
    setQuestions(newQuestions);
  };

  const handleAddChoice = (questionIndex: number) => {
    const newQuestions = [...questions];
    const choices = [...(newQuestions[questionIndex].options?.choices || [])];
    choices.push(`Option ${choices.length + 1}`);
    
    newQuestions[questionIndex].options = {
      ...newQuestions[questionIndex].options,
      choices,
    };
    
    setQuestions(newQuestions);
  };

  const handleRemoveChoice = (questionIndex: number, choiceIndex: number) => {
    const newQuestions = [...questions];
    const choices = [...(newQuestions[questionIndex].options?.choices || [])];
    
    if (choices.length <= 2) {
      toast.error("Need at least two options");
      return;
    }
    
    choices.splice(choiceIndex, 1);
    
    newQuestions[questionIndex].options = {
      ...newQuestions[questionIndex].options,
      choices,
    };
    
    setQuestions(newQuestions);
  };

  const handleMatrixItemChange = (
    questionIndex: number,
    field: "rows" | "columns",
    itemIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    const items = [...(newQuestions[questionIndex].options?.[field] || [])];
    items[itemIndex] = value;
    
    newQuestions[questionIndex].options = {
      ...newQuestions[questionIndex].options,
      [field]: items,
    };
    
    setQuestions(newQuestions);
  };

  const handleAddMatrixItem = (questionIndex: number, field: "rows" | "columns") => {
    const newQuestions = [...questions];
    const items = [...(newQuestions[questionIndex].options?.[field] || [])];
    items.push(`${field === "rows" ? "Row" : "Column"} ${items.length + 1}`);
    
    newQuestions[questionIndex].options = {
      ...newQuestions[questionIndex].options,
      [field]: items,
    };
    
    setQuestions(newQuestions);
  };

  const handleRemoveMatrixItem = (
    questionIndex: number,
    field: "rows" | "columns",
    itemIndex: number
  ) => {
    const newQuestions = [...questions];
    const items = [...(newQuestions[questionIndex].options?.[field] || [])];
    
    if (items.length <= 2) {
      toast.error(`Need at least two ${field}`);
      return;
    }
    
    items.splice(itemIndex, 1);
    
    newQuestions[questionIndex].options = {
      ...newQuestions[questionIndex].options,
      [field]: items,
    };
    
    setQuestions(newQuestions);
  };

  const handleRankingItemChange = (
    questionIndex: number,
    itemIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    const items = [...(newQuestions[questionIndex].options?.items || [])];
    items[itemIndex] = value;
    
    newQuestions[questionIndex].options = {
      ...newQuestions[questionIndex].options,
      items,
    };
    
    setQuestions(newQuestions);
  };

  const handleAddRankingItem = (questionIndex: number) => {
    const newQuestions = [...questions];
    const items = [...(newQuestions[questionIndex].options?.items || [])];
    items.push(`Item ${items.length + 1}`);
    
    newQuestions[questionIndex].options = {
      ...newQuestions[questionIndex].options,
      items,
    };
    
    setQuestions(newQuestions);
  };

  const handleRemoveRankingItem = (questionIndex: number, itemIndex: number) => {
    const newQuestions = [...questions];
    const items = [...(newQuestions[questionIndex].options?.items || [])];
    
    if (items.length <= 2) {
      toast.error("Need at least two items for ranking");
      return;
    }
    
    items.splice(itemIndex, 1);
    
    newQuestions[questionIndex].options = {
      ...newQuestions[questionIndex].options,
      items,
    };
    
    setQuestions(newQuestions);
  };

  // Handle reordering of questions
  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const reorderedQuestions = [...questions];
    const [removed] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, removed);

    setQuestions(reorderedQuestions);
  };

  const renderQuestionOptions = (question: any, index: number) => {
    switch (question.questionType) {
      case "likert":
        return (
          <div className="mt-2 space-y-2">
            <div className="flex flex-col md:flex-row md:gap-4">
              <Input
                label="Scale (1-10)"
                type="number"
                min="3"
                max="10"
                value={question.options?.scale || 5}
                onChange={(e) =>
                  handleOptionsChange(index, "scale", parseInt(e.target.value))
                }
              />
              <Input
                label="Low Label"
                value={question.options?.low || "Strongly Disagree"}
                onChange={(e) =>
                  handleOptionsChange(index, "low", e.target.value)
                }
              />
              <Input
                label="High Label"
                value={question.options?.high || "Strongly Agree"}
                onChange={(e) =>
                  handleOptionsChange(index, "high", e.target.value)
                }
              />
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Preview:</p>
              <div className="flex justify-between">
                <span className="text-xs">{question.options?.low || "Strongly Disagree"}</span>
                <div className="flex space-x-2">
                  {Array.from(
                    { length: question.options?.scale || 5 },
                    (_, i) => i + 1
                  ).map((num) => (
                    <div
                      key={num}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm"
                    >
                      {num}
                    </div>
                  ))}
                </div>
                <span className="text-xs">{question.options?.high || "Strongly Agree"}</span>
              </div>
            </div>
          </div>
        );
      case "multipleChoice":
      case "checkbox":
        return (
          <div className="mt-2 space-y-2">
            <p className="text-sm font-medium text-gray-700">Choices:</p>
            {question.options?.choices?.map(
              (choice: string, choiceIndex: number) => (
                <div key={choiceIndex} className="flex items-center">
                  <Input
                    value={choice}
                    onChange={(e) =>
                      handleChoiceChange(index, choiceIndex, e.target.value)
                    }
                    className="flex-grow"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveChoice(index, choiceIndex)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              )
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddChoice(index)}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Add Choice
            </Button>
          </div>
        );
      case "ranking":
        return (
          <div className="mt-2 space-y-2">
            <p className="text-sm font-medium text-gray-700">Ranking Items:</p>
            {question.options?.items?.map(
              (item: string, itemIndex: number) => (
                <div key={itemIndex} className="flex items-center">
                  <Input
                    value={item}
                    onChange={(e) =>
                      handleRankingItemChange(index, itemIndex, e.target.value)
                    }
                    className="flex-grow"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRankingItem(index, itemIndex)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              )
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddRankingItem(index)}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Add Item
            </Button>
          </div>
        );
      case "matrix":
        return (
          <div className="mt-2 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Rows:</p>
              {question.options?.rows?.map(
                (row: string, rowIndex: number) => (
                  <div key={rowIndex} className="flex items-center mb-2">
                    <Input
                      value={row}
                      onChange={(e) =>
                        handleMatrixItemChange(
                          index,
                          "rows",
                          rowIndex,
                          e.target.value
                        )
                      }
                      className="flex-grow"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveMatrixItem(index, "rows", rowIndex)
                      }
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                )
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddMatrixItem(index, "rows")}
                leftIcon={<PlusIcon className="w-4 h-4" />}
              >
                Add Row
              </Button>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Columns:</p>
              {question.options?.columns?.map(
                (column: string, columnIndex: number) => (
                  <div key={columnIndex} className="flex items-center mb-2">
                    <Input
                      value={column}
                      onChange={(e) =>
                        handleMatrixItemChange(
                          index,
                          "columns",
                          columnIndex,
                          e.target.value
                        )
                      }
                      className="flex-grow"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveMatrixItem(index, "columns", columnIndex)
                      }
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                )
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddMatrixItem(index, "columns")}
                leftIcon={<PlusIcon className="w-4 h-4" />}
              >
                Add Column
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const validateSurvey = () => {
    if (!title.trim()) {
      toast.error("Survey title is required");
      return false;
    }

    if (isNaN(parseInt(points)) || parseInt(points) <= 0) {
      toast.error("Points must be a positive number");
      return false;
    }

    if (isNaN(parseInt(estimatedTime)) || parseInt(estimatedTime) <= 0) {
      toast.error("Estimated time must be a positive number");
      return false;
    }

    for (const question of questions) {
      if (!question.questionText.trim()) {
        toast.error("All questions must have text");
        return false;
      }

      if (
        (question.questionType === "multipleChoice" ||
          question.questionType === "checkbox") &&
        (!question.options?.choices || question.options.choices.length < 2)
      ) {
        toast.error("Multiple choice questions must have at least 2 options");
        return false;
      }

      if (
        question.questionType === "ranking" &&
        (!question.options?.items || question.options.items.length < 2)
      ) {
        toast.error("Ranking questions must have at least 2 items");
        return false;
      }

      if (
        question.questionType === "matrix" &&
        (!question.options?.rows ||
          !question.options?.columns ||
          question.options.rows.length < 2 ||
          question.options.columns.length < 2)
      ) {
        toast.error("Matrix questions must have at least 2 rows and 2 columns");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSurvey()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const surveyData = {
        title,
        description,
        points: parseInt(points),
        estimatedTime: parseInt(estimatedTime),
        targetSpecialty: targetSpecialty || undefined,
        status,
        questions: questions.map((q, index) => ({
          ...q,
          orderIndex: index,
          // If editing, include the question ID from the database
          ...(q.questionId && { id: q.questionId }),
        })),
      };

      const url = editSurvey
        ? `/api/surveys/${editSurvey.id}`
        : `/api/surveys`;
      const method = editSurvey ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...surveyData,
          clientId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "An error occurred");
      }

      toast.success(
        `Survey ${editSurvey ? "updated" : "created"} successfully!`
      );
      router.push("/client/surveys");
    } catch (error) {
      console.error("Error saving survey:", error);
      toast.error((error as Error).message || "Failed to save survey");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Section title="Survey Details">
        <Input
          label="Survey Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          as="textarea"
          rows={3}
        />

        <Form.Row>
          <Input
            label="Points"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            min="1"
            required
          />

          <Input
            label="Estimated Time (minutes)"
            type="number"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            min="1"
            required
          />
        </Form.Row>

        <Form.Row>
          <Input
            label="Target Specialty (Optional)"
            value={targetSpecialty}
            onChange={(e) => setTargetSpecialty(e.target.value)}
            helperText="Leave empty to target all specialties"
          />

          <div className="mb-4">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-input"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </Form.Row>
      </Form.Section>

      <Form.Section title="Questions">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-6"
              >
                {questions.map((question, index) => (
                  <Draggable
                    key={question.id}
                    draggableId={question.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border border-gray-200 rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div
                            {...provided.dragHandleProps}
                            className="text-gray-500 cursor-move px-2"
                          >
                            ☰
                          </div>
                          <div className="font-medium">
                            Question {index + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>

                        <Input
                          label="Question Text"
                          value={question.questionText}
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              "questionText",
                              e.target.value
                            )
                          }
                          required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="form-label">Question Type</label>
                            <select
                              value={question.questionType}
                              onChange={(e) =>
                                handleQuestionChange(
                                  index,
                                  "questionType",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            >
                              <option value="text">Text Response</option>
                              <option value="likert">Likert Scale</option>
                              <option value="multipleChoice">
                                Multiple Choice
                              </option>
                              <option value="checkbox">Checkbox</option>
                              <option value="ranking">Ranking</option>
                              <option value="matrix">Matrix</option>
                            </select>
                          </div>

                          <div className="flex items-center mt-6">
                            <input
                              type="checkbox"
                              id={`required-${index}`}
                              checked={question.required}
                              onChange={(e) =>
                                handleQuestionChange(
                                  index,
                                  "required",
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label
                              htmlFor={`required-${index}`}
                              className="ml-2 block text-sm text-gray-700"
                            >
                              Required question
                            </label>
                          </div>
                        </div>

                        {renderQuestionOptions(question, index)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="mt-4">
          <Button
            type="button"
            onClick={handleAddQuestion}
            variant="outline"
            leftIcon={<PlusIcon className="w-5 h-5" />}
          >
            Add Question
          </Button>
        </div>
      </Form.Section>

      <Form.Submit>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="ml-2"
        >
          {editSurvey ? "Update Survey" : "Create Survey"}
        </Button>
      </Form.Submit>
    </Form>
  );
};

export default SurveyBuilder;
