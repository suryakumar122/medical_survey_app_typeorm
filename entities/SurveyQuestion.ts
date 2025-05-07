// entities/SurveyQuestion.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";

export type QuestionType = "text" | "likert" | "multipleChoice" | "checkbox" | "ranking" | "matrix";

@Entity("survey_questions")
export class SurveyQuestion {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  surveyId: string;

  @Column({ type: "text" })
  questionText: string;

  @Column({
    type: "enum",
    enum: ["text", "likert", "multipleChoice", "checkbox", "ranking", "matrix"],
  })
  questionType: QuestionType;

  @Column({ type: "jsonb", nullable: true })
  options: any;

  @Column({ default: true })
  required: boolean;

  @Column({ type: "int", default: 0 })
  orderIndex: number;

  @Column({ type: "jsonb", nullable: true })
  conditionalLogic: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne("Survey", (survey: any) => survey.questions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "surveyId" })
  survey: any;

  @OneToMany("QuestionResponse", (response: any) => response.question)
  responses: any[];
}