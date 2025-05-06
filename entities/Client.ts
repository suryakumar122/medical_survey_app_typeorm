import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { Representative } from "./Representative";
import { Survey } from "./Survey";
import { DoctorClientMapping } from "./DoctorClientMapping";

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

  @OneToOne(() => User, (user) => user.client)
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToMany(() => Representative, (rep) => rep.client)
  representatives: Representative[];

  @OneToMany(() => Survey, (survey) => survey.client)
  surveys: Survey[];

  @OneToMany(() => DoctorClientMapping, (mapping) => mapping.client)
  doctorMappings: DoctorClientMapping[];
}
