// entities/Doctor.ts
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

  @OneToMany("DoctorClientMapping", (mapping: any) => mapping.doctor)
  clientMappings: any[];

  @OneToMany("DoctorRepMapping", (mapping: any) => mapping.doctor)
  repMappings: any[];

  @OneToMany("DoctorSurveyResponse", (response: any) => response.doctor)
  surveyResponses: any[];

  @OneToMany("Redemption", (redemption: any) => redemption.doctor)
  redemptions: any[];
}