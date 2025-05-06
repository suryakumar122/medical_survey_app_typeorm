import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Client } from "./Client";
import { DoctorRepMapping } from "./DoctorRepMapping";

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

  @OneToOne(() => User, (user) => user.representative)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Client, (client) => client.representatives)
  @JoinColumn({ name: "clientId" })
  client: Client;

  @OneToMany(() => DoctorRepMapping, (mapping) => mapping.representative)
  doctorMappings: DoctorRepMapping[];
}
