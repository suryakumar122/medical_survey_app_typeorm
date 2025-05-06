import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { SurveyQuestion } from "./SurveyQuestion";
import { DoctorSurveyResponse } from "./DoctorSurveyResponse";

export type SurveyStatus = "draft" | "active" | "inactive" | "completed";

@Entity("surveys")
export class Survey {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  clientId: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "int" })
  points: number;

  @Column({ type: "int" })
  estimatedTime: number;

  @Column({
    type: "enum",
    enum: ["draft", "active", "inactive", "completed"],
    default: "draft",
  })
  status: SurveyStatus;

  @Column({ nullable: true, type: "timestamp" })
  startsAt: Date;

  @Column({ nullable: true, type: "timestamp" })
  endsAt: Date;

  @Column({ nullable: true })
  targetSpecialty: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Client, (client) => client.surveys)
  @JoinColumn({ name: "clientId" })
  client: Client;

  @OneToMany(() => SurveyQuestion, (question) => question.survey, { cascade: true })
  questions: SurveyQuestion[];

  @OneToMany(() => DoctorSurveyResponse, (response) => response.survey)
  responses: DoctorSurveyResponse[];
}
