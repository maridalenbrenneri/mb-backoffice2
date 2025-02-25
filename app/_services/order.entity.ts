import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { SubscriptionEntity } from './subscription-entity';
import { DeliveryEntity } from './delivery/delivery.entity';

export enum OrderStatus {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  DELETED = 'DELETED',
}

export enum OrderType {
  RENEWAL = 'RENEWAL',
  NON_RENEWAL = 'NON_RENEWAL',
  CUSTOM = 'CUSTOM',
}

export enum ShippingType {
  SHIP = 'SHIP',
  LOCAL_PICK_UP = 'LOCAL_PICK_UP',
}

@Entity({ name: 'Order' })
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: OrderStatus })
  status!: OrderStatus;

  @Column({ type: 'enum', enum: OrderType })
  type!: OrderType;

  @Column({ type: 'integer', unique: true, nullable: true })
  wooOrderId!: number;

  @Column({ type: 'text', unique: true, nullable: true })
  wooOrderNumber!: string;

  @Column({ type: 'timestamptz', nullable: true })
  wooCreatedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  wooUpdatedAt!: Date;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  email!: string;

  @Column({ type: 'text', nullable: true })
  mobile!: string;

  @Column({ type: 'text' })
  address1!: string;

  @Column({ type: 'text', nullable: true })
  address2!: string;

  @Column({ type: 'text' })
  postalCode!: string;

  @Column({ type: 'text' })
  postalPlace!: string;

  @Column({ type: 'text', nullable: true })
  country!: string;

  @Column({ type: 'integer', nullable: true })
  quantity250!: number;

  @Column({ type: 'integer', nullable: true })
  quantity500!: number;

  @Column({ type: 'integer', nullable: true })
  quantity1200!: number;

  @Column({ type: 'text', nullable: true })
  customerNote!: string;

  @Column({ type: 'text', nullable: true })
  internalNote!: string;

  @Column({ type: 'enum', enum: ShippingType })
  shippingType!: ShippingType;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order)
  orderItems!: OrderItemEntity[];

  @ManyToOne(() => SubscriptionEntity, (subscription) => subscription.orders, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  subscription!: SubscriptionEntity;

  @ManyToOne(() => DeliveryEntity, (delivery) => delivery.orders, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  delivery!: DeliveryEntity;

  @Column({ type: 'text', nullable: true })
  trackingUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
