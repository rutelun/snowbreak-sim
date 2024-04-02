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
  caster: Creature | undefined;
  description: string;
};

type HistoryActionEnd = {
  type: "actionEnd";
};

type HistoryDelayedActionStart = {
  type: "delayedActionStart";
  description: string;
  actionId: ActionId;
  caster: Creature | undefined;
};

type HistoryDelayedActionEnd = {
  type: "delayedActionEnd";
  actionId: ActionId;
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

type PrettifiedActionForeground = {
  type: "foreground";
  caster: Creature | undefined;
  totalDmg: number;
  totalHeal: number;
  description: string;
  battleTime: number;
};

type PrettifiedActionBackground = {
  type: "background";
  caster: Creature | undefined;
  description: string;
  battleTime: number;
};

export type PrettifiedActionType =
  | PrettifiedActionForeground
  | PrettifiedActionBackground;

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
    const result: PrettifiedActionType[] = [];
    let lastForegroundActionIndex = -1;
    let lastBackgroundActionIndex = -1;
    this.loggedActions.forEach((loggedAction) => {
      switch (loggedAction.type) {
        case "actionStart":
          result.push({
            battleTime: loggedAction.battleTime,
            type: "foreground",
            description: loggedAction.description,
            totalDmg: 0,
            totalHeal: 0,
            caster: loggedAction.caster,
          });
          lastForegroundActionIndex = result.length - 1;
          break;
        case "actionEnd":
          lastForegroundActionIndex = -1;
          break;
        case "dealDamage":
          if (
            lastForegroundActionIndex === -1 ||
            !result[lastForegroundActionIndex]
          ) {
            break;
          }

          const previousLoggedAction = result[lastForegroundActionIndex];
          if (previousLoggedAction.type !== "foreground") {
            throw new Error("wrong previous logged action type");
          }

          previousLoggedAction.totalDmg += loggedAction.value;
          break;
        case "heal":
          if (
            lastForegroundActionIndex === -1 ||
            !result[lastForegroundActionIndex]
          ) {
            break;
          }

          const previousLoggedAction1 = result[lastForegroundActionIndex];
          if (previousLoggedAction1.type !== "foreground") {
            throw new Error("wrong previous logged action type");
          }

          previousLoggedAction1.totalHeal += loggedAction.value;
          break;
        case "delayedActionStart":
          const previousBackgroundAction =
            lastBackgroundActionIndex === -1
              ? undefined
              : result[lastBackgroundActionIndex];
          if (
            previousBackgroundAction?.battleTime === loggedAction.battleTime
          ) {
            previousBackgroundAction.description +=
              "\n" + loggedAction.description;
          } else {
            result.push({
              battleTime: loggedAction.battleTime,
              type: "background",
              description: loggedAction.description,
              caster: loggedAction.caster,
            });
            lastBackgroundActionIndex = result.length - 1;
          }
        default:
          break;
      }
    });
    return result;
  }
}
