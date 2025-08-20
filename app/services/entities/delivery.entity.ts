import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeliveryStatus } from './enums';
import { ProductEntity } from './product.entity';
import { OrderEntity } from './order.entity';

@Entity({ name: 'Delivery' })
export class DeliveryEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    enumName: 'DeliveryStatus',
    default: DeliveryStatus.ACTIVE,
  })
  status!: DeliveryStatus;

  @Column({ type: 'timestamptz', unique: true })
  date!: Date;

  @Column({ type: 'text' })
  type!: string;

  @ManyToOne(() => ProductEntity, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'product1Id' })
  product1!: ProductEntity | null;

  @Column({ type: 'integer', nullable: true })
  product1Id!: number | null;

  @ManyToOne(() => ProductEntity, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'product2Id' })
  product2!: ProductEntity | null;

  @Column({ type: 'integer', nullable: true })
  product2Id!: number | null;

  @ManyToOne(() => ProductEntity, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'product3Id' })
  product3!: ProductEntity | null;

  @Column({ type: 'integer', nullable: true })
  product3Id!: number | null;

  @ManyToOne(() => ProductEntity, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'product4Id' })
  product4!: ProductEntity | null;

  @Column({ type: 'integer', nullable: true })
  product4Id!: number | null;

  @OneToMany(() => OrderEntity, (order) => order.delivery)
  orders!: OrderEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
