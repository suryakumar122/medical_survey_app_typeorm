import { DataSource } from "typeorm";
import { User } from "@entities/User";
import { Client } from "@entities/Client";
import { Representative } from "@entities/Representative";
import { Doctor } from "@entities/Doctor";
import { DoctorClientMapping } from "@entities/DoctorClientMapping";
import { DoctorRepMapping } from "@entities/DoctorRepMapping";
import { Survey } from "@entities/Survey";
import { SurveyQuestion } from "@entities/SurveyQuestion";
import { DoctorSurveyResponse } from "@entities/DoctorSurveyResponse";
import { QuestionResponse } from "@entities/QuestionResponse";
import { Redemption } from "@entities/Redemption";

// Create a simplified auth option that doesn't require TypeORM for Next.js app router
let dataSourceInitialized = false;
let globalDataSource: DataSource | null = null;

// Add better logging for database connection
console.log("Database configuration:");
console.log(`Host: ${process.env.PGHOST || "localhost"}`);
console.log(`Port: ${process.env.PGPORT || "5432"}`);
console.log(`Database: ${process.env.PGDATABASE || "postgres"}`);
console.log(`User: ${process.env.PGUSER || "postgres"}`);
console.log(`Environment: ${process.env.NODE_ENV}`);

// Use explicit connection options instead of relying on environment variables directly
const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PGHOST || "localhost",
  port: parseInt(process.env.PGPORT || "5432"),
  username: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "postgres",
  synchronize: process.env.NODE_ENV !== "production",
  logging: true,
  entities: [
    User,
    Client,
    Representative,
    Doctor,
    DoctorClientMapping,
    DoctorRepMapping,
    Survey,
    SurveyQuestion,
    DoctorSurveyResponse,
    QuestionResponse,
    Redemption
  ],
  subscribers: [],
  migrations: [],
});

// Modified to avoid repeated initialization attempts and better logging
export const getDataSource = async (): Promise<DataSource> => {
  console.log("getDataSource called, initialized:", dataSourceInitialized);
  
  if (globalDataSource && globalDataSource.isInitialized) {
    console.log("Returning existing initialized data source");
    return globalDataSource;
  }
  
  if (!dataSourceInitialized) {
    console.log("Initializing data source...");
    try {
      if (!AppDataSource.isInitialized) {
        console.log("AppDataSource not initialized, initializing now...");
        globalDataSource = await AppDataSource.initialize();
        console.log("AppDataSource initialization successful");
      } else {
        console.log("AppDataSource already initialized");
        globalDataSource = AppDataSource;
      }
      dataSourceInitialized = true;
      console.log("Data Source has been initialized successfully");
    } catch (error) {
      console.error("Error during Data Source initialization", error);
      // Still set dataSourceInitialized to true to prevent repeated initialization attempts
      dataSourceInitialized = true;
      throw error;
    }
  }
  
  return globalDataSource!;
};

// Helper function to get a repository - catches errors internally and provides better logging
export const getRepository = async <T>(entity: any) => {
  try {
    console.log(`Getting repository for entity: ${entity.name || "Unknown entity"}`);
    const dataSource = await getDataSource();
    // console.log("globalDataSource initialized:", globalDataSource);
    const repository = dataSource.getRepository<T>(entity);
    console.log(`Successfully got repository for: ${entity.name || "Unknown entity"}`);
    return repository;
  } catch (error) {
    console.error(`Error getting repository for entity: ${entity.name || "Unknown entity"}`, error);
    throw new Error(`Failed to get repository for ${entity.name || "Unknown entity"}`);
  }
};