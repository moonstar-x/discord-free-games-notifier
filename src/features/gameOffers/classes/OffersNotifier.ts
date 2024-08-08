import logger from '@moonstar-x/logger';
import { ExtendedClient } from '../../../base/client/ExtendedClient';
import { GameOffer } from '../../../models/gameOffer';
import { subscribeToOffers, UnsubscribeFunction } from '../pubsub/subscribeToOffers';

export class OffersNotifier {
  public readonly client: ExtendedClient;

  private subscription: UnsubscribeFunction | null;

  public constructor(client: ExtendedClient) {
    this.client = client;
    this.subscription = null;
  }

  public async subscribe(): Promise<void> {
    if (this.subscription) {
      await this.subscription();
    }

    this.subscription = await subscribeToOffers(this.handleOffer.bind(this));
  }

  private async handleOffer(offer: GameOffer): Promise<void> {
    logger.info(`Received new offer from Redis: ${offer.title} on ${offer.storefront}`);
  }
}
