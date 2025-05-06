import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Doctor } from "./Doctor";
import { Representative } from "./Representative";

@Entity("doctor_rep_mappings")
export class DoctorRepMapping {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  doctorId: string;

  @Column()
  repId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.repMappings)
  @JoinColumn({ name: "doctorId" })
  doctor: Doctor;

  @ManyToOne(() => Representative, (rep) => rep.doctorMappings)
  @JoinColumn({ name: "repId" })
  representative: Representative;
}
