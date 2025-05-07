// entities/Survey.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";

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

  @ManyToOne("Client", (client: any) => client.surveys)
  @JoinColumn({ name: "clientId" })
  client: any;

  @OneToMany("SurveyQuestion", (question: any) => question.survey, { cascade: true })
  questions: any[];

  @OneToMany("DoctorSurveyResponse", (response: any) => response.survey)
  responses: any[];
}