import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { ProductStatus, ProductStockStatus } from './enums';
import { DeliveryEntity } from './delivery.entity';
import { OrderItemEntity } from './order-item.entity';

// TODO: MIGRATE THESE IN THE DATABASE
// NEW columns
// sortOrder
// purchasePriceCurrency
// stockRemainingWarning

// RENAMED columns
// beanType -> coffee_beanType
// processType -> coffee_processType
// cuppingScore -> coffee_cuppingScore
// labelsPrinted -> coffee_labelsPrinted
// country -> coffee_country

@Entity({ name: 'Product' })
export class ProductEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'text', default: 'coffee' })
  category!: string;

  @Column({ type: 'integer', default: 0 })
  sortOrder!: number;

  @Column({ type: 'enum', enum: ProductStatus, enumName: 'ProductStatus' })
  status!: ProductStatus;

  @Column({
    type: 'enum',
    enum: ProductStockStatus,
    enumName: 'ProductStockStatus',
  })
  stockStatus!: ProductStockStatus;

  @Column({ type: 'text', nullable: true })
  productCode!: string | null;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'integer', nullable: true })
  stockInitial!: number | null;

  @Column({ type: 'integer', nullable: true })
  stockRemaining!: number | null;

  @Column({ type: 'integer', nullable: true })
  stockRemainingWarning!: number | null;

  @Column({ type: 'text', nullable: true })
  infoLink!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'float', nullable: true })
  retailPrice!: string | null;

  @Column({ type: 'float', nullable: true })
  purchasePrice!: number | null;

  @Column({ type: 'float', nullable: true })
  purchasePriceCurrency!: string | null;

  @Column({ type: 'text', nullable: true })
  internalNote!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  //
  // Woo specific fields, for Webshop products
  //

  @Column({ type: 'integer', nullable: true, unique: true })
  wooProductId!: number | null;

  @Column({ type: 'text', nullable: true })
  wooProductUrl!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  wooCreatedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  wooUpdatedAt!: Date | null;

  //
  // Coffee category specific fields
  //

  @Column({ type: 'text', nullable: true })
  coffee_country!: string | null;

  @Column({ type: 'boolean', default: false })
  coffee_labelsPrinted!: boolean;

  @Column({ type: 'text', nullable: true })
  coffee_beanType!: string | null;

  @Column({ type: 'text', nullable: true })
  coffee_processType!: string | null;

  @Column({ type: 'float', nullable: true })
  coffee_cuppingScore!: number | null;

  //
  // Relations
  //

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.product1)
  deliveriesAsProduct1!: DeliveryEntity[];

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.product2)
  deliveriesAsProduct2!: DeliveryEntity[];

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.product3)
  deliveriesAsProduct3!: DeliveryEntity[];

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.product4)
  deliveriesAsProduct4!: DeliveryEntity[];

  @OneToMany(() => OrderItemEntity, (item) => item.product)
  orderItems!: OrderItemEntity[];
}
