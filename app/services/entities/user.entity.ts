import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'User' })
export class UserEntity {
  @PrimaryColumn('text')
  id!: string; // cuid

  @Column({ type: 'text', unique: true })
  email!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ type: 'text' })
  passwordHash!: string;
}
