// entities/Client.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";

@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  contactPerson: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToMany("Representative", (representative: any) => representative.client)
  representatives: any[];

  @OneToMany("Survey", (survey: any) => survey.client)
  surveys: any[];

  @OneToMany("DoctorClientMapping", (mapping: any) => mapping.client)
  doctorMappings: any[];
}