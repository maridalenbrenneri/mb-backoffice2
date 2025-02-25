import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { CoffeeEntity } from './coffee.entity';
import { ProductEntity } from './product.entity';
import { OrderEntity } from './order.entity';

@Entity({ name: 'OrderItem' })
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', unique: true, nullable: true })
  wooOrderItemId!: number;

  @Column({ type: 'text' })
  variation!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @ManyToOne(() => CoffeeEntity, (coffee) => coffee.OrderItems, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  coffee!: CoffeeEntity;

  @ManyToOne(() => ProductEntity, (product) => product.OrderItems, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  product!: ProductEntity;

  @ManyToOne(() => OrderEntity, (order) => order.orderItems, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  order!: OrderEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
