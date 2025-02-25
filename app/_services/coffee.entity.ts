import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DeliveryEntity } from './delivery/delivery.entity';
import { OrderItemEntity } from './order-item.entity';

export enum CoffeeStatus {
  ACTIVE = 'ACTIVE',
  SOLD_OUT = 'SOLD_OUT',
  IN_STOCK = 'IN_STOCK',
  ORDERED = 'ORDERED',
  DELETED = 'DELETED',
}

@Entity({ name: 'Coffee' })
export class CoffeeEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: CoffeeStatus })
  status!: CoffeeStatus;

  @Column({ type: 'text' })
  productCode!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  country!: string;

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.coffee1)
  DeliveryCoffee1!: DeliveryEntity[];

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.coffee2)
  DeliveryCoffee2!: DeliveryEntity[];

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.coffee3)
  DeliveryCoffee3!: DeliveryEntity[];

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.coffee4)
  DeliveryCoffee4!: DeliveryEntity[];

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.coffee)
  OrderItems!: OrderItemEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
