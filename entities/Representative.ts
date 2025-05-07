import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Client } from "./Client";

@Entity("representatives")
export class Representative {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  territory: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Client, client => client.representatives)
  @JoinColumn({ name: "clientId" })
  client: Client;

  // Use string reference to avoid circular dependency
  @OneToMany("DoctorRepMapping", "representative")
  doctorMappings: any[];
}