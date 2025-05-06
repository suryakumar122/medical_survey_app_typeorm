import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Survey } from "./Survey";
import { QuestionResponse } from "./QuestionResponse";

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

  @ManyToOne(() => Survey, (survey) => survey.questions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "surveyId" })
  survey: Survey;

  @OneToMany(() => QuestionResponse, (response) => response.question)
  responses: QuestionResponse[];
}
