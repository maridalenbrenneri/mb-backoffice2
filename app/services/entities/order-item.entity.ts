import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ProductEntity } from './product.entity';
import { OrderEntity } from './order.entity';

@Entity({ name: 'OrderItem' })
export class OrderItemEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'integer', nullable: true, unique: true })
  wooOrderItemId!: number | null;

  @Column({ type: 'text' })
  variation!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @ManyToOne(() => ProductEntity, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: ProductEntity | null;

  @Column({ type: 'integer', nullable: true })
  productId!: number | null;

  @ManyToOne(() => OrderEntity, (order) => order.orderItems, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order!: OrderEntity;

  @Column({ type: 'integer' })
  orderId!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
