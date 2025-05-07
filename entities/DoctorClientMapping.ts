import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
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

  // Use string reference to avoid circular dependency
  @ManyToOne("Doctor", "clientMappings")
  @JoinColumn({ name: "doctorId" })
  doctor: any;

  @ManyToOne(() => Client, client => client.doctorMappings)
  @JoinColumn({ name: "clientId" })
  client: Client;
}