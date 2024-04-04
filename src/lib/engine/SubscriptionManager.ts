import type { Creature } from "./Creature";
import type { SkillType, DamageType, ElementType } from "./AttributeManager";
import type { Formula } from "~/lib/engine/Formula";
import type { ActionId } from "~/lib/engine/TimeManager";
import type { Engine } from "~/lib/engine/Engine";

export type SubscriptionId = Symbol;

export type Subscriptions = {
  onHeal: {
    value: number;
    target: Creature;
  };
  onSwap: {
    previousActive: Creature;
    currentActive: Creature;
  };
  onDamageDealt: {
    value: number;
    formula: Formula;
    critRateFormula: Formula;
    element: ElementType;
    damageType: DamageType;
    caster: Creature;
    target: Creature;
  };
  onPartialReload: {
    caster: Creature;
  };
  onBeforeSkillUsed: {
    skillType: SkillType;
    caster: Creature;
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

type TemporarySubscribeOptions<SubscriptionType extends keyof Subscriptions> = {
  type: SubscriptionType;
  duration: number;
  description: string;
  subscriber: (opts: Subscriptions[SubscriptionType]) => void;
};

export class SubscriptionManager {
  private subscribers: Subscribers = {};
  private actions: Map<SubscriptionId, ActionId> = new Map();

  private deleteSubscribers: Map<SubscriptionId, () => void> = new Map();

  public constructor(private engine: Engine) {}

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

  public temporarySubscribe<SubscriptionType extends keyof Subscriptions>(
    props: TemporarySubscribeOptions<SubscriptionType>,
  ) {
    const subscriptionId = this.subscribe(props.type, props.subscriber);
    const actionId = this.engine.timeManager.addPlannedAction({
      description: props.description,
      type: "once",
      waitingDuration: props.duration,
      action: () => this.unsubscribe(subscriptionId),
    });
    this.actions.set(subscriptionId, actionId);

    return subscriptionId;
  }

  public updateTemporarySubscribeDuration(
    subscriptionId: SubscriptionId,
    newDuration: number,
  ) {
    const actionId = this.actions.get(subscriptionId);
    if (!actionId) {
      return;
    }

    if (this.engine.timeManager.hasActionInQueue(actionId)) {
      this.engine.timeManager.changeRemainingDuration(actionId, newDuration);
    }
  }

  public unsubscribe(subscriptionId: SubscriptionId) {
    const deleteSubscriber = this.deleteSubscribers.get(subscriptionId);
    deleteSubscriber?.();
    this.deleteSubscribers.delete(subscriptionId);
    const plannedActionId = this.actions.get(subscriptionId);
    if (plannedActionId) {
      this.engine.timeManager.deletePlannedAction(plannedActionId);
      this.actions.delete(subscriptionId);
    }
  }

  public trigger<SubscriptionType extends keyof Subscriptions>(
    type: SubscriptionType,
    data: Subscriptions[SubscriptionType],
  ) {
    this.subscribers[type]?.forEach((subsriber) => subsriber(data));
  }
}
