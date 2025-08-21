import { DateTime } from 'luxon';
import { ensureDataSourceInitialized } from '~/typeorm/data-source';
import { In } from 'typeorm';
import { SubscriptionEntity } from '~/services/entities';
import {
  SubscriptionType,
  SubscriptionStatus,
  SubscriptionFrequency,
  SubscriptionSpecialRequest,
  ShippingType,
} from '~/services/entities';
import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '~/settings';
import { areEqual } from '~/utils/are-equal';
import { getNextFirstTuesday } from '~/utils/dates';

export type { SubscriptionEntity as Subscription };

// Type definitions
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

export type CreateSubscriptionData = Pick<
  SubscriptionEntity,
  | 'type'
  | 'status'
  | 'frequency'
  | 'shippingType'
  | 'quantity250'
  | 'quantity500'
  | 'quantity1200'
  | 'specialRequest'
  | 'recipientName'
  | 'recipientEmail'
  | 'recipientMobile'
  | 'recipientAddress1'
  | 'recipientAddress2'
  | 'recipientPostalCode'
  | 'recipientPostalPlace'
  | 'isPrivateDeliveryAddress'
  | 'internalNote'
  | 'fikenContactId'
  | 'wooCustomerName'
>;

export type WooUpsertSubscriptionData = Pick<
  SubscriptionEntity,
  | 'type'
  | 'status'
  | 'frequency'
  | 'shippingType'
  | 'quantity250'
  | 'recipientName'
  | 'recipientEmail'
  | 'recipientMobile'
  | 'recipientAddress1'
  | 'recipientAddress2'
  | 'recipientPostalCode'
  | 'recipientPostalPlace'
  | 'isPrivateDeliveryAddress'
  | 'wooCustomerId'
  | 'wooCustomerName'
  | 'wooSubscriptionId'
  | 'wooNextPaymentDate'
  | 'wooCreatedAt'
  | 'wooUpdatedAt'
>;

export type WooGiftSubscriptionCreateInput = Pick<
  SubscriptionEntity,
  | 'status'
  | 'frequency'
  | 'quantity250'
  | 'quantity500'
  | 'quantity1200'
  | 'recipientName'
  | 'recipientEmail'
  | 'recipientMobile'
  | 'recipientAddress1'
  | 'recipientAddress2'
  | 'recipientPostalCode'
  | 'recipientPostalPlace'
  | 'customerNote'
  | 'internalNote'
  | 'wooCustomerName'
  | 'wooCustomerId'
  | 'wooCreatedAt'
  | 'wooUpdatedAt'
  | 'gift_wooOrderId'
  | 'gift_wooOrderLineItemId'
  | 'gift_firstDeliveryDate'
  | 'gift_customerFirstDeliveryDate'
  | 'gift_durationMonths'
  | 'gift_messageToRecipient'
>;

async function getRepo() {
  const ds = await ensureDataSourceInitialized();
  return ds.getRepository(SubscriptionEntity);
}

// Repository functions
export async function getSubscription(filter: any) {
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
  if (filter.orderBy) options.order = filter.orderBy; // TypeORM uses 'order' not 'orderBy'
  if (filter.take) options.take = filter.take;
  if (filter.skip) options.skip = filter.skip;

  const repo = await getRepo();
  return repo.findOne(options);
}

export async function getSubscriptions(filter?: any) {
  console.log('getSubscriptions', filter);
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
  if (filter.orderBy) options.order = filter.orderBy; // TypeORM uses 'order' not 'orderBy'
  if (filter.take) options.take = filter.take;
  if (filter.skip) options.skip = filter.skip;

  // ADD DEFAULT FILTER VALUES IF NOT OVERIDDEN IN FILTER INPUT
  if (!options.order) options.order = { updatedAt: 'desc' };
  if (!options.take || options.take > TAKE_MAX_ROWS)
    options.take = TAKE_DEFAULT_ROWS;
  // TODO: Always exclude DELETED

  const repo = await getRepo();
  return repo.find(options);
}

export async function getSubscriptionsPaginated(filter?: any) {
  filter = filter || {};

  const options: any = {};

  if (filter.include) {
    const relations: string[] = [];
    Object.keys(filter.include).forEach((key) => {
      relations.push(key);
    });
    options.relations = relations;
  } else if (filter.relations) {
    options.relations = filter.relations;
  }

  if (filter.where) options.where = filter.where;
  if (filter.orderBy) options.order = filter.orderBy;
  if (typeof filter.take === 'number')
    options.take = Math.min(filter.take, TAKE_MAX_ROWS);
  if (typeof filter.skip === 'number') options.skip = filter.skip;

  if (!options.order) options.order = { updatedAt: 'desc' };
  if (!options.take || options.take > TAKE_MAX_ROWS)
    options.take = TAKE_DEFAULT_ROWS;

  const repo = await getRepo();
  const [data, total] = await repo.findAndCount(options);

  return {
    data,
    total,
    pageSize: options.take,
    page: Math.floor((options.skip || 0) / options.take) + 1,
  };
}

export async function create(data: CreateSubscriptionData) {
  const repo = await getRepo();
  const entity = repo.create(data);
  return repo.save(entity);
}

export async function update(id: number, data: AtLeastOne<SubscriptionEntity>) {
  const repo = await getRepo();
  const entity = await repo.preload({ id, ...(data as any) } as any);
  if (!entity) return null;
  return await repo.save(entity);
}

export async function updateStatusOnSubscription(
  id: number,
  status: SubscriptionStatus
) {
  const repo = await getRepo();
  const entity = await repo.preload({ id, status } as any);
  if (!entity) return null;
  return await repo.save(entity);
}

export async function updateFirstDeliveryDateOnGiftSubscription(
  id: number,
  gift_firstDeliveryDate: any
) {
  const repo = await getRepo();
  const entity = await repo.preload({ id, gift_firstDeliveryDate } as any);
  if (!entity) return null;
  return await repo.save(entity);
}

// WOO IMPORT
export async function createGiftSubscriptionFromWoo(
  input: WooGiftSubscriptionCreateInput
) {
  const repo = await getRepo();
  const entity = repo.create({
    type: SubscriptionType.PRIVATE_GIFT,
    shippingType: ShippingType.SHIP,
    recipientCountry: 'NO',
    ...input,
  });
  return repo.save(entity);
}

// WOO IMPORT
export async function upsertSubscriptionFromWoo(
  data: WooUpsertSubscriptionData
): Promise<{
  result: 'updated' | 'new' | 'notChanged';
  subscriptionId: number;
}> {
  const repo = await getRepo();
  const existing = await repo.findOne({
    where: { wooSubscriptionId: data.wooSubscriptionId as number | undefined },
  });

  if (existing) {
    const keys = Object.keys(data) as (keyof SubscriptionEntity)[];
    let isChanged = false;
    for (const key of keys) {
      if (
        !areEqual(
          (existing as any)[key],
          data[key as keyof WooUpsertSubscriptionData]
        )
      ) {
        isChanged = true;
        break;
      }
    }
    if (isChanged) {
      const toSave = await repo.preload({
        id: existing.id,
        ...(data as any),
      } as any);
      if (toSave) {
        await repo.save(toSave);
      }
      return { result: 'updated', subscriptionId: existing.id };
    }
    return { result: 'notChanged', subscriptionId: existing.id };
  }

  const created = await repo.save(
    repo.create({
      ...data,
      recipientCountry: 'NO',
    })
  );
  return { result: 'new', subscriptionId: created.id };
}

// Service functions
function calculateSubscriptionWeight(subscription: SubscriptionEntity) {
  let weight = 0;

  if (subscription.quantity250) weight += subscription.quantity250 * 250;
  if (subscription.quantity500) weight += subscription.quantity500 * 500;
  if (subscription.quantity1200) weight += subscription.quantity1200 * 1200;

  return weight / 1000;
}

export function resolveSpecialRequestCode(
  specialRequest: SubscriptionSpecialRequest
) {
  switch (specialRequest) {
    case SubscriptionSpecialRequest.TWO_COFFEE_TYPES:
      return '__R2';
    case SubscriptionSpecialRequest.NO_DRY_PROCESSED:
      return '__R5';
    case SubscriptionSpecialRequest.ONLY_DRY_PROCESSED:
      return '__R6';
    default:
      return '';
  }
}

export function resolveSubscriptionCode(subscription: SubscriptionEntity) {
  const translateType = (type: SubscriptionType) => {
    switch (type) {
      case SubscriptionType.PRIVATE_GIFT:
        return 'GABO';
      case SubscriptionType.PRIVATE:
        return 'ABO';
      case SubscriptionType.B2B:
        return 'B2B';
      default:
        return 'UNKNOWN';
    }
  };

  const type = translateType(subscription.type);
  const freq =
    subscription.frequency === SubscriptionFrequency.FORTNIGHTLY ? '2' : '1';

  if (subscription.type === SubscriptionType.B2B) {
    return `${type}${freq}-${calculateSubscriptionWeight(subscription)}kg`;
  }

  const quantity = subscription.quantity250;

  return `${type}${freq}-${quantity}`;
}

// TODO: RESOLVE COMPLETED STATUS FROM ORDERS COMPLETED INSTEAD OF DATE (CANNOT BE DONE UNTIL ALL ACTIVE GABOS HAVE BEEN IMPORTED FROM THE START)
export function resolveStatusForGiftSubscription(
  durationMonths: number,
  firstDeliveryDate: DateTime
): SubscriptionStatus {
  const first = firstDeliveryDate.startOf('month');

  const last = first.plus({ months: durationMonths - 1 }).plus({ days: 7 });

  const today = DateTime.now().startOf('day');

  const nextMonthly = getNextFirstTuesday(today);

  if (today > last) return SubscriptionStatus.COMPLETED;

  if (first > nextMonthly) return SubscriptionStatus.NOT_STARTED;

  return SubscriptionStatus.ACTIVE;
}

export async function updateStatusOnGiftSubscriptions() {
  const repo = await getRepo();
  const gifts = await repo.find({
    where: {
      status: In([SubscriptionStatus.ACTIVE, SubscriptionStatus.NOT_STARTED]),
      type: SubscriptionType.PRIVATE_GIFT,
    },
    select: {
      id: true,
      status: true,
      gift_durationMonths: true,
      gift_firstDeliveryDate: true,
    },
    take: TAKE_MAX_ROWS,
  });

  let updatedCount = 0;

  console.debug(`Checking status on ${gifts.length} gift subscriptions`);

  for (const gift of gifts) {
    const duration = gift.gift_durationMonths as number;
    const date = DateTime.fromISO(
      (gift.gift_firstDeliveryDate as Date).toISOString()
    );

    const status = resolveStatusForGiftSubscription(duration, date);

    if (gift.status !== status) {
      console.debug(
        `Detected new status for gift subscription ${gift.id}. Updating from ${gift.status} to ${status}`
      );

      await updateStatusOnSubscription(gift.id, status);

      updatedCount++;
    }
  }

  return { updatedCount };
}
