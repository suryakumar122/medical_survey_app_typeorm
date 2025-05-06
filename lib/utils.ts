import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Combine className utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hash password for storage
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

// Generate random token
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Format date
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format time
export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format datetime
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// Calculate estimated completion time
export function calculateEstimatedTime(questions: any[]): number {
  // Average time per question based on type
  const timePerQuestionType = {
    text: 30, // 30 seconds
    likert: 15, // 15 seconds
    multipleChoice: 20, // 20 seconds
    checkbox: 25, // 25 seconds
    ranking: 40, // 40 seconds
    matrix: 45, // 45 seconds
  };

  const totalSeconds = questions.reduce((total, question) => {
    const type = question.questionType as keyof typeof timePerQuestionType;
    const timePerQuestion = timePerQuestionType[type] || 30; // Default to 30 seconds
    return total + timePerQuestion;
  }, 0);

  // Convert to minutes and round up
  return Math.ceil(totalSeconds / 60);
}

// API Response helper functions
export function successResponse<T>(data: T, message: string = "Success") {
  return NextResponse.json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      message: error,
    },
    { status }
  );
}

// CSV Parsing and generation
export function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(value => value.trim());
    const obj: Record<string, string> = {};
    
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] || '';
    }
    
    result.push(obj);
  }
  
  return result;
}

export function generateCSV(data: Record<string, any>[], fields: string[]): string {
  // Header row
  let csv = fields.join(',') + '\n';
  
  // Data rows
  data.forEach(item => {
    const values = fields.map(field => {
      const value = item[field]?.toString() || '';
      // Escape quotes and wrap with quotes if value contains comma
      return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csv += values.join(',') + '\n';
  });
  
  return csv;
}
