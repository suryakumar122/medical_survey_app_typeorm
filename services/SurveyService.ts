import { getRepository } from "@lib/db";
import { Survey, SurveyStatus } from "@entities/Survey";
import { SurveyQuestion } from "@entities/SurveyQuestion";
import { DoctorSurveyResponse } from "@entities/DoctorSurveyResponse";
import { QuestionResponse } from "@entities/QuestionResponse";
import { Doctor } from "@entities/Doctor";
import { sendPointsEarnedNotification, sendSurveyNotification } from "@lib/email";
import { DoctorService } from "./DoctorService";
import { UserService } from "./UserService";

export class SurveyService {
  static async getSurveyById(id: string): Promise<Survey | null> {
    try {
      const surveyRepository = await getRepository<Survey>(Survey);
      const survey = await surveyRepository.findOne({
        where: { id },
        relations: ["questions", "client"],
      });
      
      return survey;
    } catch (error) {
      console.error("Error getting survey by ID:", error);
      return null;
    }
  }

  static async getSurveysByClientId(clientId: string): Promise<Survey[]> {
    try {
      const surveyRepository = await getRepository<Survey>(Survey);
      const surveys = await surveyRepository.find({
        where: { clientId },
        relations: ["questions"],
        order: { createdAt: "DESC" },
      });
      
      return surveys;
    } catch (error) {
      console.error("Error getting surveys by client ID:", error);
      return [];
    }
  }

  static async getActiveSurveysForDoctor(doctorId: string): Promise<Survey[]> {
    try {
      const doctorRepository = await getRepository<Doctor>(Doctor);
      const doctor = await doctorRepository.findOne({ 
        where: { id: doctorId },
        relations: ["clientMappings", "clientMappings.client"]
      });
      
      if (!doctor) {
        throw new Error("Doctor not found");
      }
      
      const clientIds = doctor.clientMappings.map(mapping => mapping.clientId);
      
      if (clientIds.length === 0) {
        return [];
      }
      
      const surveyRepository = await getRepository<Survey>(Survey);
      const surveys = await surveyRepository.createQueryBuilder("survey")
        .where("survey.clientId IN (:...clientIds)", { clientIds })
        .andWhere("survey.status = :status", { status: "active" })
        .leftJoinAndSelect("survey.questions", "questions")
        .leftJoinAndSelect("survey.client", "client")
        .leftJoinAndSelect(
          subQuery => {
            return subQuery
              .select("response.surveyId", "surveyId")
              .addSelect("response.doctorId", "doctorId")
              .from(DoctorSurveyResponse, "response")
              .where("response.doctorId = :doctorId", { doctorId })
          }, 
          "doctorResponses", 
          "doctorResponses.surveyId = survey.id"
        )
        .andWhere("doctorResponses.surveyId IS NULL OR doctorResponses.completed = false")
        .orderBy("survey.createdAt", "DESC")
        .getMany();
      
      return surveys;
    } catch (error) {
      console.error("Error getting active surveys for doctor:", error);
      return [];
    }
  }

  static async getCompletedSurveysForDoctor(doctorId: string): Promise<DoctorSurveyResponse[]> {
    try {
      const responseRepository = await getRepository<DoctorSurveyResponse>(DoctorSurveyResponse);
      const responses = await responseRepository.find({
        where: { doctorId, completed: true },
        relations: ["survey", "survey.client"],
        order: { completedAt: "DESC" },
      });
      
      return responses;
    } catch (error) {
      console.error("Error getting completed surveys for doctor:", error);
      return [];
    }
  }

  static async createSurvey(
    clientId: string, 
    surveyData: { 
      title: string; 
      description?: string; 
      points: number; 
      estimatedTime: number; 
      questions: any[]; 
      status?: SurveyStatus;
      startsAt?: Date;
      endsAt?: Date;
      targetSpecialty?: string;
    }
  ): Promise<Survey | null> {
    try {
      const surveyRepository = await getRepository<Survey>(Survey);
      const questionRepository = await getRepository<SurveyQuestion>(SurveyQuestion);
      
      // Create survey
      const newSurvey = surveyRepository.create({
        clientId,
        title: surveyData.title,
        description: surveyData.description || null,
        points: surveyData.points,
        estimatedTime: surveyData.estimatedTime,
        status: surveyData.status || "draft",
        startsAt: surveyData.startsAt || null,
        endsAt: surveyData.endsAt || null,
        targetSpecialty: surveyData.targetSpecialty || null,
      });
      
      const savedSurvey = await surveyRepository.save(newSurvey);
      
      // Create questions
      if (surveyData.questions && surveyData.questions.length > 0) {
        const questionEntities = surveyData.questions.map((q, index) => 
          questionRepository.create({
            surveyId: savedSurvey.id,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options || null,
            required: q.required !== undefined ? q.required : true,
            orderIndex: index,
            conditionalLogic: q.conditionalLogic || null,
          })
        );
        
        await questionRepository.save(questionEntities);
      }
      
      // If the survey is active, notify eligible doctors
      if (surveyData.status === "active") {
        await this.notifyDoctorsAboutNewSurvey(savedSurvey.id);
      }
      
      return this.getSurveyById(savedSurvey.id);
    } catch (error) {
      console.error("Error creating survey:", error);
      throw error;
    }
  }

  static async updateSurveyStatus(surveyId: string, status: SurveyStatus): Promise<boolean> {
    try {
      const surveyRepository = await getRepository<Survey>(Survey);
      const survey = await surveyRepository.findOne({ where: { id: surveyId } });
      
      if (!survey) {
        throw new Error("Survey not found");
      }
      
      // If changing from non-active to active, notify doctors
      const shouldNotifyDoctors = survey.status !== "active" && status === "active";
      
      survey.status = status;
      await surveyRepository.save(survey);
      
      if (shouldNotifyDoctors) {
        await this.notifyDoctorsAboutNewSurvey(surveyId);
      }
      
      return true;
    } catch (error) {
      console.error("Error updating survey status:", error);
      return false;
    }
  }

  static async submitSurveyResponse(
    doctorId: string,
    surveyId: string,
    responses: { questionId: string; responseData: any }[]
  ): Promise<boolean> {
    try {
      const surveyRepository = await getRepository<Survey>(Survey);
      const responseRepository = await getRepository<DoctorSurveyResponse>(DoctorSurveyResponse);
      const questionResponseRepository = await getRepository<QuestionResponse>(QuestionResponse);
      
      // Check if the survey exists and is active
      const survey = await surveyRepository.findOne({ 
        where: { id: surveyId, status: "active" },
        relations: ["questions"],
      });
      
      if (!survey) {
        throw new Error("Survey not found or not active");
      }
      
      // Check if all required questions are answered
      const requiredQuestionIds = survey.questions
        .filter(q => q.required)
        .map(q => q.id);
      
      const answeredRequiredQuestionIds = responses
        .filter(r => requiredQuestionIds.includes(r.questionId))
        .map(r => r.questionId);
      
      if (requiredQuestionIds.length !== answeredRequiredQuestionIds.length) {
        throw new Error("All required questions must be answered");
      }
      
      // Check if there's an existing incomplete response
      let doctorResponse = await responseRepository.findOne({
        where: { doctorId, surveyId, completed: false },
      });
      
      if (!doctorResponse) {
        // Create a new response
        doctorResponse = responseRepository.create({
          doctorId,
          surveyId,
          startedAt: new Date(),
          completed: true,
          completedAt: new Date(),
          pointsEarned: survey.points,
        });
      } else {
        // Update existing response
        doctorResponse.completed = true;
        doctorResponse.completedAt = new Date();
        doctorResponse.pointsEarned = survey.points;
      }
      
      const savedResponse = await responseRepository.save(doctorResponse);
      
      // Save individual question responses
      const questionResponses = responses.map(r => 
        questionResponseRepository.create({
          doctorSurveyResponseId: savedResponse.id,
          questionId: r.questionId,
          responseData: r.responseData,
        })
      );
      
      await questionResponseRepository.save(questionResponses);
      
      // Update doctor's points
      await DoctorService.updateDoctorPoints(doctorId, survey.points);
      
      // Send notification email about earned points
      const doctor = await DoctorService.getDoctorById(doctorId);
      if (doctor && doctor.user) {
        await sendPointsEarnedNotification(
          doctor.user.email,
          doctor.user.name,
          survey.points,
          survey.title
        );
      }
      
      return true;
    } catch (error) {
      console.error("Error submitting survey response:", error);
      throw error;
    }
  }

  static async getSurveyAnalytics(surveyId: string): Promise<any> {
    try {
      const responseRepository = await getRepository<DoctorSurveyResponse>(DoctorSurveyResponse);
      
      // Get the survey
      const surveyRepository = await getRepository<Survey>(Survey);
      const survey = await surveyRepository.findOne({ 
        where: { id: surveyId },
        relations: ["questions"],
      });
      
      if (!survey) {
        throw new Error("Survey not found");
      }
      
      // Get all responses
      const responses = await responseRepository.find({
        where: { surveyId },
        relations: ["questionResponses", "doctor", "doctor.user"],
      });
      
      // Calculate completion rate
      const totalResponses = responses.length;
      const completedResponses = responses.filter(r => r.completed).length;
      const completionRate = totalResponses > 0 ? completedResponses / totalResponses : 0;
      
      // Calculate average completion time (in minutes)
      const completionTimes = responses
        .filter(r => r.completed && r.startedAt && r.completedAt)
        .map(r => {
          const start = new Date(r.startedAt!).getTime();
          const end = new Date(r.completedAt!).getTime();
          return Math.round((end - start) / (1000 * 60)); // Convert to minutes
        });
      
      const averageCompletionTime = completionTimes.length > 0
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
        : 0;
      
      // Analyze responses by question
      const questionAnalytics = survey.questions.map(question => {
        const questionResponses = responses
          .filter(r => r.completed)
          .flatMap(r => r.questionResponses)
          .filter(qr => qr.questionId === question.id);
        
        let analysisData: any = {
          questionId: question.id,
          questionText: question.questionText,
          questionType: question.questionType,
          responseCount: questionResponses.length,
        };
        
        // Specific analysis based on question type
        if (question.questionType === "likert" || question.questionType === "multipleChoice") {
          const optionCounts: Record<string, number> = {};
          
          questionResponses.forEach(qr => {
            const value = qr.responseData.value;
            optionCounts[value] = (optionCounts[value] || 0) + 1;
          });
          
          analysisData.optionCounts = optionCounts;
        } else if (question.questionType === "checkbox") {
          const optionCounts: Record<string, number> = {};
          
          questionResponses.forEach(qr => {
            const values = qr.responseData.values || [];
            values.forEach((value: string) => {
              optionCounts[value] = (optionCounts[value] || 0) + 1;
            });
          });
          
          analysisData.optionCounts = optionCounts;
        } else if (question.questionType === "text") {
          analysisData.responses = questionResponses.map(qr => qr.responseData.text);
        }
        
        return analysisData;
      });
      
      return {
        surveyId,
        title: survey.title,
        totalResponses,
        completedResponses,
        completionRate,
        averageCompletionTime,
        totalPointsAwarded: completedResponses * survey.points,
        questionAnalytics,
      };
    } catch (error) {
      console.error("Error getting survey analytics:", error);
      throw error;
    }
  }

  private static async notifyDoctorsAboutNewSurvey(surveyId: string): Promise<void> {
    try {
      const survey = await this.getSurveyById(surveyId);
      
      if (!survey) {
        console.error("Survey not found for notification");
        return;
      }
      
      // Get eligible doctors (with the client mapping)
      const doctors = await DoctorService.getDoctorsByClientId(survey.clientId);
      
      // If there's a target specialty, filter doctors
      const eligibleDoctors = survey.targetSpecialty
        ? doctors.filter(d => d.specialty === survey.targetSpecialty)
        : doctors;
      
      // Send notifications
      for (const doctor of eligibleDoctors) {
        const user = await UserService.getUserById(doctor.userId);
        
        if (user && user.status === "active") {
          const surveyLink = `${process.env.NEXTAUTH_URL}/doctor/surveys/${surveyId}`;
          await sendSurveyNotification(
            user.email,
            user.name,
            survey.title,
            surveyLink
          );
        }
      }
    } catch (error) {
      console.error("Error notifying doctors about new survey:", error);
    }
  }
}
