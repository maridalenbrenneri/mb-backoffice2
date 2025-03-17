import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderEntity } from '../order/order.entity';

export enum SubscriptionType {
  PRIVATE = 'PRIVATE',
  PRIVATE_GIFT = 'PRIVATE_GIFT',
  B2B = 'B2B',
}

export enum SubscriptionStatus {
  NOT_STARTED = 'NOT_STARTED',
  ACTIVE = 'ACTIVE',
  PASSIVE = 'PASSIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  DELETED = 'DELETED',
}

export enum SubscriptionFrequency {
  MONTHLY = 'MONTHLY',
  MONTHLY_3RD = 'MONTHLY_3RD',
  FORTNIGHTLY = 'FORTNIGHTLY',
}

export enum SubscriptionSpecialRequest {
  NONE = 'NONE',
  TWO_COFFEE_TYPES = 'TWO_COFFEE_TYPES',
  NO_DRY_PROCESSED = 'NO_DRY_PROCESSED',
  ONLY_DRY_PROCESSED = 'ONLY_DRY_PROCESSED',
}

@Entity({ name: 'Subscription' })
export class SubscriptionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: SubscriptionType })
  type!: SubscriptionType;

  @Column({ type: 'enum', enum: SubscriptionStatus })
  status!: SubscriptionStatus;

  @Column({ type: 'enum', enum: SubscriptionFrequency })
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
    default: SubscriptionSpecialRequest.NONE,
  })
  specialRequest!: SubscriptionSpecialRequest;

  @Column({ type: 'text' })
  shippingType!: string;

  @Column({ type: 'text', nullable: true })
  customerNote!: string;

  @Column({ type: 'text', nullable: true })
  internalNote!: string;

  @Column({ type: 'text', nullable: true })
  fikenContactId!: string;

  @Column({ type: 'integer', unique: true, nullable: true })
  wooSubscriptionId!: number;

  @Column({ type: 'integer', nullable: true })
  wooCustomerId!: number;

  @Column({ type: 'text', nullable: true })
  wooCustomerName!: string;

  @Column({ type: 'timestamptz', nullable: true })
  wooNextPaymentDate!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  wooCreatedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  wooUpdatedAt!: Date;

  @Column({ type: 'integer', nullable: true })
  gift_wooOrderId!: number;

  @Column({ type: 'text', unique: true, nullable: true })
  gift_wooOrderLineItemId!: string;

  @Column({ type: 'integer', nullable: true })
  gift_durationMonths!: number;

  @Column({ type: 'text', nullable: true })
  gift_messageToRecipient!: string;

  @Column({ type: 'timestamptz', nullable: true })
  gift_firstDeliveryDate!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  gift_customerFirstDeliveryDate!: Date;

  @OneToMany(() => OrderEntity, (order) => order.subscription)
  orders!: OrderEntity[];

  @Column({ type: 'text', default: '' })
  recipientName!: string;

  @Column({ type: 'text', nullable: true })
  recipientEmail!: string;

  @Column({ type: 'text', nullable: true })
  recipientMobile!: string;

  @Column({ type: 'text' })
  recipientAddress1!: string;

  @Column({ type: 'text', nullable: true })
  recipientAddress2!: string;

  @Column({ type: 'text' })
  recipientPostalCode!: string;

  @Column({ type: 'text' })
  recipientPostalPlace!: string;

  @Column({ type: 'text', nullable: true })
  recipientCountry!: string;

  @Column({ type: 'boolean', default: true })
  isPrivateDeliveryAddress!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
