// entities/Representative.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne,OneToMany } from "typeorm";
import { User } from "./User";

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

  @ManyToOne("Client", (client: any) => client.representatives)
  @JoinColumn({ name: "clientId" })
  client: any;

  @OneToMany("DoctorRepMapping", (mapping: any) => mapping.representative)
  doctorMappings: any[];
}