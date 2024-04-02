import type { Creature } from "./Creature";
import type { Engine } from "./Engine";
import type { ActionId } from "./TimeManager";
import type { DamageType, ElementType } from "./AttributeManager";

type HistoryItemDealDamage = {
  type: "dealDamage";
  value: number;
  element: ElementType;
  damageType: DamageType;
  caster: Creature;
  target: Creature;
};
type HistoryItemHeal = {
  type: "heal";
  value: number;
  caster: Creature;
  target: Creature;
};

type HistoryActionStart = {
  type: "actionStart";
  description: string;
};

type HistoryActionEnd = {
  type: "actionEnd";
};

type HistoryDelayedActionStart = {
  type: "delayedActionStart";
  description: string;
  actionId: ActionId;
};

type HistoryDelayedActionEnd = {
  type: "delayedActionStart";
};

type HistoryItem =
  | HistoryItemDealDamage
  | HistoryItemHeal
  | HistoryActionStart
  | HistoryActionEnd
  | HistoryDelayedActionStart
  | HistoryDelayedActionEnd;

type HistoryItemWithBattleTime = HistoryItem & {
  battleTime: number;
};

export class HistoryManager {
  private loggedActions: HistoryItemWithBattleTime[] = [];

  public constructor(private engine: Engine) {}

  // TODO: use subscriptions
  public add(historyItem: HistoryItem) {
    this.loggedActions.push({
      battleTime: this.engine.timeManager.getBattleTime(),
      ...historyItem,
    });
  }

  public getPrettified() {
    return this.loggedActions;
  }
}
