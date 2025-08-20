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
import { OrderStatus, OrderType, ShippingType } from './enums';
import { OrderItemEntity } from './order-item.entity';
import { SubscriptionEntity } from './subscription.entity';
import { DeliveryEntity } from './delivery.entity';

@Entity({ name: 'Order' })
export class OrderEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'enum', enum: OrderStatus, enumName: 'OrderStatus' })
  status!: OrderStatus;

  @Column({ type: 'enum', enum: OrderType, enumName: 'OrderType' })
  type!: OrderType;

  @Column({ type: 'integer', nullable: true, unique: true })
  wooOrderId!: number | null;

  @Column({ type: 'text', nullable: true, unique: true })
  wooOrderNumber!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  wooCreatedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  wooUpdatedAt!: Date | null;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  email!: string | null;

  @Column({ type: 'text', nullable: true })
  mobile!: string | null;

  @Column({ type: 'text' })
  address1!: string;

  @Column({ type: 'text', nullable: true })
  address2!: string | null;

  @Column({ type: 'text' })
  postalCode!: string;

  @Column({ type: 'text' })
  postalPlace!: string;

  @Column({ type: 'text', nullable: true })
  country!: string | null;

  @Column({ type: 'integer', nullable: true })
  quantity250!: number | null;

  @Column({ type: 'integer', nullable: true })
  quantity500!: number | null;

  @Column({ type: 'integer', nullable: true })
  quantity1200!: number | null;

  @Column({ type: 'text', nullable: true })
  customerNote!: string | null;

  @Column({ type: 'text', nullable: true })
  internalNote!: string | null;

  @Column({ type: 'enum', enum: ShippingType, enumName: 'ShippingType' })
  shippingType!: ShippingType;

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  orderItems!: OrderItemEntity[];

  @ManyToOne(() => SubscriptionEntity, (subscription) => subscription.orders, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'subscriptionId' })
  subscription!: SubscriptionEntity;

  @Column({ type: 'integer' })
  subscriptionId!: number;

  @ManyToOne(() => DeliveryEntity, (delivery) => delivery.orders, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'deliveryId' })
  delivery!: DeliveryEntity;

  @Column({ type: 'integer' })
  deliveryId!: number;

  @Column({ type: 'text', nullable: true })
  trackingUrl!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
