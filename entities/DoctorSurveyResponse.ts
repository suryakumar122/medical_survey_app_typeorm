import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Doctor } from "./Doctor";
import { Survey } from "./Survey";
import { QuestionResponse } from "./QuestionResponse";

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

  @ManyToOne(() => Doctor, (doctor) => doctor.surveyResponses)
  @JoinColumn({ name: "doctorId" })
  doctor: Doctor;

  @ManyToOne(() => Survey, (survey) => survey.responses)
  @JoinColumn({ name: "surveyId" })
  survey: Survey;

  @OneToMany(() => QuestionResponse, (response) => response.doctorSurveyResponse, { cascade: true })
  questionResponses: QuestionResponse[];
}
