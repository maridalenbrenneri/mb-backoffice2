import { dataSource } from '~/db.server';
import { OrderEntity, ShippingType } from './order.entity';
import { OrderItemEntity } from './order-item.entity';

export class OrderService {
  private manager = dataSource.manager;

  async getOrderById(id: number, relations?: string[]) {
    return this.manager.findOne(OrderEntity, {
      where: { id },
      relations,
    });
  }

  async getOrders(filter: any = {}) {
    const { orderBy = { date: 'DESC' }, take, where } = filter;
    return this.manager.find(OrderEntity, {
      where,
      order: orderBy,
      take,
    });
  }

  async upsertOrder(id: number | null, data: Partial<OrderEntity>) {
    return this.manager.save(OrderEntity, {
      ...data,
      id: id || undefined,
      shippingType: data.shippingType || ShippingType.SHIP,
    });
  }

  async upsertOrderItem(id: number | null, data: Partial<OrderItemEntity>) {
    return this.manager.save(OrderItemEntity, {
      ...data,
      id: id || undefined,
    });
  }
}
