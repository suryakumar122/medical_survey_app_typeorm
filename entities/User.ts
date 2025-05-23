// entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export type UserRole = "doctor" | "representative" | "client" | "admin";
export type UserStatus = "pending" | "active" | "inactive" | "suspended";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: "enum",
    enum: ["doctor", "representative", "client", "admin"],
  })
  role: UserRole;

  @Column({
    type: "enum",
    enum: ["pending", "active", "inactive", "suspended"],
    default: "pending",
  })
  status: UserStatus;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  activationToken: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true, type: "timestamp" })
  resetPasswordExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}