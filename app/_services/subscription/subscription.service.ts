import { dataSource } from '~/db.server';
import { SubscriptionEntity } from './subscription-entity';

export class SubscriptionService {
  private manager = dataSource.manager;

  async getSubscriptions() {
    return this.manager.find(SubscriptionEntity);
  }

  async getSubscriptionById(id: number) {
    return this.manager.findOne(SubscriptionEntity, {
      where: { id },
    });
  }

  /*
   * Updates
   */

  async upsertSubscription(
    id: number | null,
    data: Partial<SubscriptionEntity>
  ) {
    return this.manager.save(SubscriptionEntity, {
      ...data,
      id: id || undefined,
    });
  }

  // Triggered from cron job
  async updateStatusOnGiftSubscriptions() {
    // const gifts = await subscriptionRepository.getSubscriptions({
    //   where: {
    //     status: {
    //       in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.NOT_STARTED],
    //     },
    //     type: SubscriptionType.PRIVATE_GIFT,
    //   },
    //   select: {
    //     id: true,
    //     status: true,
    //     gift_durationMonths: true,
    //     gift_firstDeliveryDate: true,
    //   },
    //   take: TAKE_MAX_ROWS,
    // });
    // let updatedCount = 0;
    // console.debug(`Checking status on ${gifts.length} gift subscriptions`);
    // for (const gift of gifts) {
    //   const duration = gift.gift_durationMonths as number;
    //   const date = DateTime.fromISO(
    //     (gift.gift_firstDeliveryDate as Date).toISOString()
    //   );
    //   const status = resolveStatusForGiftSubscription(duration, date);
    //   if (gift.status !== status) {
    //     console.debug(
    //       `Detected new status for gift subscription ${gift.id}. Updating from ${gift.status} to ${status}`
    //     );
    //     // console.debug('GIFT', duration, date.toISO());
    //     await subscriptionRepository.updateStatusOnSubscription(
    //       gift.id,
    //       status
    //     );
    //     updatedCount++;
    //   }
    // }
    // return { updatedCount };
    return { updatedCount: 0 };
  }
}
