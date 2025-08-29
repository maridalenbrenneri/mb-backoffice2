import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import {
  ProductStatus,
  ProductStockLocation,
  ProductStockStatus,
} from './enums';
import { DeliveryEntity } from './delivery.entity';
import { OrderItemEntity } from './order-item.entity';

@Entity({ name: 'Product' })
export class ProductEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'enum', enum: ProductStatus, enumName: 'ProductStatus' })
  status!: ProductStatus;

  @Column({
    type: 'enum',
    enum: ProductStockStatus,
    enumName: 'ProductStockStatus',
  })
  stockStatus!: ProductStockStatus;

  @Column({ type: 'text', default: 'coffee' })
  category!: string;

  @Column({ type: 'text', nullable: true })
  productCode!: string | null;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  country!: string | null;

  @Column({ type: 'integer', nullable: true, unique: true })
  wooProductId!: number | null;

  @Column({ type: 'text', nullable: true })
  wooProductUrl!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  wooCreatedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  wooUpdatedAt!: Date | null;

  @Column({ type: 'integer', nullable: true })
  stockInitial!: number | null;

  @Column({ type: 'integer', nullable: true })
  stockRemaining!: number | null;

  @Column({ type: 'boolean', default: false })
  labelsPrinted!: boolean;

  @Column({ type: 'text', nullable: true })
  infoLink!: string | null;

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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
