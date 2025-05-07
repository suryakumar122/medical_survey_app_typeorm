// entities/DoctorSurveyResponse.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";

@Entity("doctor_survey_responses")
export class DoctorSurveyResponse {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  doctorId: string;

  @Column()
  surveyId: string;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: "int", default: 0 })
  pointsEarned: number;

  @Column({ type: "timestamp", nullable: true })
  startedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne("Doctor", (doctor: any) => doctor.surveyResponses)
  @JoinColumn({ name: "doctorId" })
  doctor: any;

  @ManyToOne("Survey", (survey: any) => survey.responses)
  @JoinColumn({ name: "surveyId" })
  survey: any;

  @OneToMany("QuestionResponse", (response: any) => response.doctorSurveyResponse, { cascade: true })
  questionResponses: any[];
}