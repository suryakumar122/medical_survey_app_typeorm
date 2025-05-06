import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { DoctorSurveyResponse } from "./DoctorSurveyResponse";
import { SurveyQuestion } from "./SurveyQuestion";

@Entity("question_responses")
export class QuestionResponse {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  doctorSurveyResponseId: string;

  @Column()
  questionId: string;

  @Column({ type: "jsonb" })
  responseData: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => DoctorSurveyResponse, (response) => response.questionResponses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "doctorSurveyResponseId" })
  doctorSurveyResponse: DoctorSurveyResponse;

  @ManyToOne(() => SurveyQuestion, (question) => question.responses)
  @JoinColumn({ name: "questionId" })
  question: SurveyQuestion;
}
