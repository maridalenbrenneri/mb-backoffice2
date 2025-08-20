import { DateTime } from 'luxon';
import { Between } from 'typeorm';
import { getRepository } from '~/services/repository.utils';
import { DeliveryEntity } from '~/services/entities';
import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '~/settings';
import { getNextDeliveryDateFrom } from '~/utils/dates';

export type { DeliveryEntity as Delivery };

export type DeliveryUpsertData = Pick<
  DeliveryEntity,
  'date' | 'type' | 'product1Id' | 'product2Id' | 'product3Id' | 'product4Id'
>;

async function getRepo() {
  return getRepository(DeliveryEntity);
}

// Repository functions
export async function getDeliveryById(id: number, include?: any) {
  const repo = await getRepo();

  const options: any = { where: { id } };

  // Convert include to relations for TypeORM compatibility
  if (include) {
    if (include.relations) {
      options.relations = include.relations;
    } else if (include.include) {
      // Convert include object to relations array
      const relations: string[] = [];
      Object.keys(include.include).forEach((key) => {
        relations.push(key);
      });
      options.relations = relations;
    } else {
      // Assume it's already a relations array
      options.relations = include;
    }
  }

  return repo.findOne(options);
}

export async function getDeliveries(filter?: any) {
  filter = filter || {};

  const options: any = {};

  // Handle include to relations conversion if needed
  if (filter.include) {
    // Convert include object to relations array
    const relations: string[] = [];
    Object.keys(filter.include).forEach((key) => {
      relations.push(key);
    });
    options.relations = relations;
  } else if (filter.relations) {
    options.relations = filter.relations;
  }

  // Copy other filter properties
  if (filter.where) options.where = filter.where;
  if (filter.orderBy) options.order = filter.orderBy;
  if (filter.take) options.take = filter.take;
  if (filter.skip) options.skip = filter.skip;

  // ADD DEFAULT FILTER VALUES IF NOT OVERIDDEN IN FILTER INPUT
  if (!options.order) options.order = { date: 'desc' };
  if (!options.take || options.take > TAKE_MAX_ROWS)
    options.take = TAKE_DEFAULT_ROWS;

  //  options.where = options.where || {};
  // TODO: Always exclude DELETED

  const repo = await getRepo();
  return repo.find(options);
}

async function getDelivery(filter: any) {
  if (!filter) return null;

  const options: any = {};

  // Handle include to relations conversion if needed
  if (filter.include) {
    // Convert include object to relations array
    const relations: string[] = [];
    Object.keys(filter.include).forEach((key) => {
      relations.push(key);
    });
    options.relations = relations;
  } else if (filter.relations) {
    options.relations = filter.relations;
  }

  // Copy other filter properties
  if (filter.where) options.where = filter.where;
  if (filter.orderBy) options.order = filter.orderBy;
  if (filter.take) options.take = filter.take;
  if (filter.skip) options.skip = filter.skip;

  const repo = await getRepo();
  return repo.findOne(options);
}

export async function upsertDelivery(
  id: number | null,
  data: DeliveryUpsertData
) {
  const repo = await getRepo();
  if (id) {
    const entity = await repo.preload({ id, ...(data as any) } as any);
    if (!entity) return null;
    return await repo.save(entity);
  } else {
    const entity = repo.create({
      date: data.date,
      type: data.type,
      product1Id: data.product1Id || null,
      product2Id: data.product2Id || null,
      product3Id: data.product3Id || null,
      product4Id: data.product4Id || null,
    });
    return await repo.save(entity);
  }
}

// Service functions
// RESOLVES NEXT DELIVERY AFTER TODAY OR ON THE DATE SPECIFIED. IF DELIVERY DOESN'T EXIST, IT IS CREATED
export async function getNextOrCreateDelivery(
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
    ? await getDelivery({
        // RETURN ONLY DELIVERY DAY IF EXISTS ON THE SPECIFIC DATE
        where: {
          date: Between(currentDate.toJSDate(), currentDate.toJSDate()),
        },
      })
    : await getDelivery({
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

  const nextDelivery = await upsertDelivery(null, {
    date: nextDate.date.toJSDate(),
    type: nextDate.type,
    product1Id: null,
    product2Id: null,
    product3Id: null,
    product4Id: null,
  });

  if (!nextDelivery) throw new Error('Failed to create delivery');

  return nextDelivery;
}

export function getNextDeliveryFromList(deliveries: DeliveryEntity[]) {
  const today = DateTime.now().startOf('day');
  const nextweek = today.plus({ days: 7 });

  return deliveries.find((d) => {
    const date = DateTime.fromISO(d.date.toString());
    return date >= today && date < nextweek;
  });
}
