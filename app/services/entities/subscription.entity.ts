import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  SubscriptionType,
  SubscriptionStatus,
  SubscriptionFrequency,
  SubscriptionSpecialRequest,
  ShippingType,
} from './enums';
import { OrderEntity } from './order.entity';

@Entity({ name: 'Subscription' })
export class SubscriptionEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({
    type: 'enum',
    enum: SubscriptionType,
    enumName: 'SubscriptionType',
  })
  type!: SubscriptionType;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    enumName: 'SubscriptionStatus',
  })
  status!: SubscriptionStatus;

  @Column({
    type: 'enum',
    enum: SubscriptionFrequency,
    enumName: 'SubscriptionFrequency',
  })
  frequency!: SubscriptionFrequency;

  @Column({ type: 'integer', default: 0 })
  quantity250!: number;

  @Column({ type: 'integer', default: 0 })
  quantity500!: number;

  @Column({ type: 'integer', default: 0 })
  quantity1200!: number;

  @Column({
    type: 'enum',
    enum: SubscriptionSpecialRequest,
    enumName: 'SubscriptionSpecialRequest',
    default: SubscriptionSpecialRequest.NONE,
  })
  specialRequest!: SubscriptionSpecialRequest;

  @Column({ type: 'enum', enum: ShippingType, enumName: 'ShippingType' })
  shippingType!: ShippingType;

  @Column({ type: 'text', nullable: true })
  customerNote!: string | null;

  @Column({ type: 'text', nullable: true })
  internalNote!: string | null;

  // B2B
  @Column({ type: 'text', nullable: true })
  fikenContactId!: string | null;

  // PRIVATE from Woo
  @Column({ type: 'integer', nullable: true, unique: true })
  wooSubscriptionId!: number | null;

  @Column({ type: 'integer', nullable: true })
  wooCustomerId!: number | null;

  @Column({ type: 'text', nullable: true })
  wooCustomerName!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  wooNextPaymentDate!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  wooCreatedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  wooUpdatedAt!: Date | null;

  // PRIVATE_GIFT
  @Column({ type: 'integer', nullable: true })
  gift_wooOrderId!: number | null;

  @Column({ type: 'text', nullable: true, unique: true })
  gift_wooOrderLineItemId!: string | null;

  @Column({ type: 'integer', nullable: true })
  gift_durationMonths!: number | null;

  @Column({ type: 'text', nullable: true })
  gift_messageToRecipient!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  gift_firstDeliveryDate!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  gift_customerFirstDeliveryDate!: Date | null;

  @OneToMany(() => OrderEntity, (order) => order.subscription)
  orders!: OrderEntity[];

  @Column({ type: 'text', default: '' })
  recipientName!: string;

  @Column({ type: 'text', nullable: true })
  recipientEmail!: string | null;

  @Column({ type: 'text', nullable: true })
  recipientMobile!: string | null;

  @Column({ type: 'text' })
  recipientAddress1!: string;

  @Column({ type: 'text', nullable: true })
  recipientAddress2!: string | null;

  @Column({ type: 'text' })
  recipientPostalCode!: string;

  @Column({ type: 'text' })
  recipientPostalPlace!: string;

  @Column({ type: 'text', nullable: true })
  recipientCountry!: string | null;

  @Column({ type: 'boolean', default: true })
  isPrivateDeliveryAddress!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
