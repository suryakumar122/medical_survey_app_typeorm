import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
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

  // Use string reference to avoid circular dependency
  @ManyToOne("Doctor", "repMappings")
  @JoinColumn({ name: "doctorId" })
  doctor: any;

  @ManyToOne(() => Representative, rep => rep.doctorMappings)
  @JoinColumn({ name: "repId" })
  representative: Representative;
}