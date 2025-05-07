// entities/DoctorClientMapping.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity("doctor_client_mappings")
export class DoctorClientMapping {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  doctorId: string;

  @Column()
  clientId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne("Doctor", (doctor: any) => doctor.clientMappings)
  @JoinColumn({ name: "doctorId" })
  doctor: any;

  @ManyToOne("Client", (client: any) => client.doctorMappings)
  @JoinColumn({ name: "clientId" })
  client: any;
}