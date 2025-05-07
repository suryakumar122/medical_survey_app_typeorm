// entities/DoctorRepMapping.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";

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

  @ManyToOne("Doctor", (doctor: any) => doctor.repMappings)
  @JoinColumn({ name: "doctorId" })
  doctor: any;

  @ManyToOne("Representative", (rep: any) => rep.doctorMappings)
  @JoinColumn({ name: "repId" })
  representative: any;
}