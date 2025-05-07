// entities/QuestionResponse.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";

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

  @ManyToOne("DoctorSurveyResponse", (response: any) => response.questionResponses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "doctorSurveyResponseId" })
  doctorSurveyResponse: any;

  @ManyToOne("SurveyQuestion", (question: any) => question.responses)
  @JoinColumn({ name: "questionId" })
  question: any;
}