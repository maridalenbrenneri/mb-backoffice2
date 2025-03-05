import { DeliveryEntity } from './delivery.entity';
import { DateTime } from 'luxon';
import { Between } from 'typeorm';
import { getNextDeliveryDateFrom } from '~/_libs/core/utils/dates';
import { dataSource } from '~/db.server';

export class DeliveryService {
  private manager = dataSource.manager;

  async getDeliveryById(id: number, relations?: string[]) {
    return this.manager.findOne(DeliveryEntity, {
      where: { id },
      relations,
    });
  }

  async getDeliveries(filter: any = {}) {
    const { orderBy = { date: 'DESC' }, take, where } = filter;
    return this.manager.find(DeliveryEntity, {
      where,
      order: orderBy,
      take,
    });
  }

  async getDelivery(filter: any) {
    return await this.manager.findOne(DeliveryEntity, { ...filter });
  }

  async upsertDelivery(id: number | null, data: Partial<DeliveryEntity>) {
    return this.manager.save(DeliveryEntity, {
      id: id || undefined,
      ...data,
      updatedAt: new Date(),
    });
  }

  async getNextOrCreateDelivery(
    date: DateTime | undefined = undefined
  ): Promise<DeliveryEntity> {
    const currentDate = date
      ? date.startOf('day')
      : DateTime.now().startOf('day');
    const nextweek = currentDate.plus({ days: 7 });

    console.debug(
      'getNextOrCreateDelivery, finding Delivery day between dates ',
      currentDate.toISO(),
      nextweek.toISO()
    );

    const delivery = date
      ? await this.getDelivery({
          // RETURN ONLY DELIVERY DAY IF EXISTS ON THE SPECIFIC DATE
          where: {
            date: Between(currentDate.toJSDate(), currentDate.toJSDate()),
          },
        })
      : await this.getDelivery({
          // RETURN DELIVERY DAY IF ANY EXISTS IN THE COMING WEEK
          where: {
            date: Between(currentDate.toJSDate(), nextweek.toJSDate()),
          },
        });

    if (delivery) {
      console.debug(
        'getNextOrCreateDelivery, Delivery day found, returning existing ',
        delivery.id,
        delivery.date,
        delivery.type
      );

      return delivery;
    }

    // DELIVERY NOT FOUND, CREATE

    console.debug(
      'getNextOrCreateDelivery, creating new Delivery day from date',
      currentDate.toISO()
    );

    const nextDate = getNextDeliveryDateFrom(currentDate);

    return await this.manager.save(DeliveryEntity, {
      date: nextDate.date.toJSDate(),
      type: nextDate.type,
      updatedAt: new Date(),
    });
  }
}
