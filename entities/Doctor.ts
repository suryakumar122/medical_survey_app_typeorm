import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { DoctorClientMapping } from "./DoctorClientMapping";
import { DoctorRepMapping } from "./DoctorRepMapping";
import { DoctorSurveyResponse } from "./DoctorSurveyResponse";
import { Redemption } from "./Redemption";

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

  @OneToOne(() => User, (user) => user.doctor)
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToMany(() => DoctorClientMapping, (mapping) => mapping.doctor)
  clientMappings: DoctorClientMapping[];

  @OneToMany(() => DoctorRepMapping, (mapping) => mapping.doctor)
  repMappings: DoctorRepMapping[];

  @OneToMany(() => DoctorSurveyResponse, (response) => response.doctor)
  surveyResponses: DoctorSurveyResponse[];

  @OneToMany(() => Redemption, (redemption) => redemption.doctor)
  redemptions: Redemption[];
}
