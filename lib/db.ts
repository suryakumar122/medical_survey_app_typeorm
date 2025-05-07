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

// Use explicit connection options instead of relying on environment variables directly
const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PGHOST || "localhost",
  port: parseInt(process.env.PGPORT || "5432"),
  username: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "medical_survey_db",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV === "development",
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

// Modified to avoid repeated initialization attempts
export const getDataSource = async (): Promise<DataSource> => {
  if (globalDataSource && globalDataSource.isInitialized) {
    return globalDataSource;
  }
  
  if (!dataSourceInitialized) {
    try {
      if (!AppDataSource.isInitialized) {
        globalDataSource = await AppDataSource.initialize();
      } else {
        globalDataSource = AppDataSource;
      }
      dataSourceInitialized = true;
      console.log("Data Source has been initialized");
    } catch (error) {
      console.error("Error during Data Source initialization", error);
      // Still set dataSourceInitialized to true to prevent repeated initialization attempts
      dataSourceInitialized = true;
      throw error;
    }
  }
  
  return globalDataSource!;
};

// Helper function to get a repository - catches errors internally
export const getRepository = async <T>(entity: any) => {
  try {
    const dataSource = await getDataSource();
    return dataSource.getRepository<T>(entity);
  } catch (error) {
    console.error(`Error getting repository for entity: ${entity.name}`, error);
    throw new Error(`Failed to get repository for ${entity.name}`);
  }
};