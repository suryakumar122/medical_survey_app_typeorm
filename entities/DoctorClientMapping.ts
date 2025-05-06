import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Doctor } from "./Doctor";
import { Client } from "./Client";

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

  @ManyToOne(() => Doctor, (doctor) => doctor.clientMappings)
  @JoinColumn({ name: "doctorId" })
  doctor: Doctor;

  @ManyToOne(() => Client, (client) => client.doctorMappings)
  @JoinColumn({ name: "clientId" })
  client: Client;
}
