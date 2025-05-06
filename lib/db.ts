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

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PGHOST || "localhost",
  port: parseInt(process.env.PGPORT || "5432"),
  username: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "medical_survey_db",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
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

declare global {
  var dataSource: DataSource | undefined;
}

// Use existing dataSource if available in development to prevent multiple connections
export const getDataSource = async (): Promise<DataSource> => {
  if (process.env.NODE_ENV === 'production') {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    return AppDataSource;
  }

  if (global.dataSource) {
    if (!global.dataSource.isInitialized) {
      await global.dataSource.initialize();
    }
    return global.dataSource;
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  
  global.dataSource = AppDataSource;
  return AppDataSource;
};

// Helper function to get a specific repository
export const getRepository = async <T>(entity: any) => {
  const dataSource = await getDataSource();
  return dataSource.getRepository<T>(entity);
};
