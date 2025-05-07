import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";

@Entity("doctors")
export class Doctor {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  specialty: string;

  @Column({ nullable: true })
  hospital: string;

  @Column({ type: "text", nullable: true })
  bio: string;

  @Column({ type: "int", default: 0 })
  totalPoints: number;

  @Column({ type: "int", default: 0 })
  redeemedPoints: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  // We'll define relationships using strings instead of direct imports to avoid circular dependencies
  @OneToMany("DoctorClientMapping", "doctor")
  clientMappings: any[];

  @OneToMany("DoctorRepMapping", "doctor")
  repMappings: any[];

  @OneToMany("DoctorSurveyResponse", "doctor")
  surveyResponses: any[];

  @OneToMany("Redemption", "doctor")
  redemptions: any[];
}