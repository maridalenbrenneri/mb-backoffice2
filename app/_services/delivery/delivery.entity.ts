import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ProductEntity } from '../product/product.entity';
import { OrderEntity } from '../order/order.entity';

export enum DeliveryStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

@Entity({ name: 'Delivery' })
export class DeliveryEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.ACTIVE,
  })
  status!: DeliveryStatus;

  @Column({ type: 'timestamptz' })
  date!: Date;

  @Column({ type: 'text' })
  type!: string;

  @ManyToOne(() => ProductEntity, (product) => product.DeliveryProduct1, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  product1!: ProductEntity;

  @ManyToOne(() => ProductEntity, (product) => product.DeliveryProduct2, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  product2!: ProductEntity;

  @ManyToOne(() => ProductEntity, (product) => product.DeliveryProduct3, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  product3!: ProductEntity;

  @ManyToOne(() => ProductEntity, (product) => product.DeliveryProduct4, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  product4!: ProductEntity;

  @OneToMany(() => OrderEntity, (order) => order.delivery)
  orders!: OrderEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
