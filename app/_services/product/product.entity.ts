import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DeliveryEntity } from '../delivery/delivery.entity';
import { OrderItemEntity } from '../order/order-item.entity';

export enum ProductStatus {
  PUBLISHED = 'PUBLISHED',
  PRIVATE = 'PRIVATE',
  DELETED = 'DELETED',
}

export enum ProductStockStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  IN_ORDER = 'IN_ORDER',
}

@Entity({ name: 'Product' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: ProductStatus })
  status!: ProductStatus;

  @Column({ type: 'enum', enum: ProductStockStatus })
  stockStatus!: ProductStockStatus;

  @Column({ type: 'text' })
  category!: string;

  @Column({ type: 'text', nullable: true })
  productCode!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  country!: string;

  @Column({ type: 'integer', unique: true, nullable: true })
  wooProductId!: number;

  @Column({ type: 'text', nullable: true })
  wooProductUrl!: string;

  @Column({ type: 'timestamptz', nullable: true })
  wooCreatedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  wooUpdatedAt!: Date;

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.product1)
  DeliveryProduct1!: DeliveryEntity[];

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.product2)
  DeliveryProduct2!: DeliveryEntity[];

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.product3)
  DeliveryProduct3!: DeliveryEntity[];

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.product4)
  DeliveryProduct4!: DeliveryEntity[];

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.product)
  OrderItems!: OrderItemEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
