import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Doctor } from "./Doctor";

export type RedemptionStatus = "pending" | "processing" | "completed" | "rejected";
export type RedemptionType = "upi" | "amazon";

@Entity("redemptions")
export class Redemption {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  doctorId: string;

  @Column({ type: "int" })
  points: number;

  @Column({
    type: "enum",
    enum: ["upi", "amazon"],
  })
  redemptionType: RedemptionType;

  @Column({ type: "jsonb" })
  redemptionDetails: any;

  @Column({
    type: "enum",
    enum: ["pending", "processing", "completed", "rejected"],
    default: "pending",
  })
  status: RedemptionStatus;

  @Column({ type: "text", nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.redemptions)
  @JoinColumn({ name: "doctorId" })
  doctor: Doctor;
}
