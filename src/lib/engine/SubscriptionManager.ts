import type { Creature } from "./Creature";
import type { SkillType } from "./AttributeManager";

export type SubscriptionId = Symbol;

export type Subscriptions = {
  onHeal: {
    value: number;
    target: Creature;
  };
  onSkillUsed: {
    skillType: SkillType;
    caster: Creature;
  };
};

type Subscribers = {
  [SubscribeType in keyof Subscriptions]?: Map<
    SubscriptionId,
    (opts: Subscriptions[SubscribeType]) => void
  >;
};

export class SubscriptionManager {
  private subscribers: Subscribers = {};

  private deleteSubscribers: Map<SubscriptionId, () => void> = new Map();

  public subscribe<SubscriptionType extends keyof Subscriptions>(
    type: SubscriptionType,
    subscriber: (opts: Subscriptions[SubscriptionType]) => void,
  ) {
    if (!this.subscribers[type]) {
      this.subscribers[type] = new Map();
    }

    const subscriptionId = Symbol("subscriptionId");

    this.subscribers[type]?.set(subscriptionId, subscriber);
    this.deleteSubscribers.set(subscriptionId, () =>
      this.subscribers[type]?.delete(subscriptionId),
    );

    return subscriptionId;
  }

  public unsubscribe(subscriptionId: SubscriptionId) {
    const deleteSubscriber = this.deleteSubscribers.get(subscriptionId);
    deleteSubscriber?.();
    this.deleteSubscribers.delete(subscriptionId);
  }

  public trigger<SubscriptionType extends keyof Subscriptions>(
    type: SubscriptionType,
    data: Subscriptions[SubscriptionType],
  ) {
    this.subscribers[type]?.forEach((subsriber) => subsriber(data));
  }
}
