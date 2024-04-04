import type { Creature } from "./Creature";
import type { Engine } from "./Engine";
import type { ActionId } from "./TimeManager";
import type {
  AttributeWithDistribution,
  DamageType,
  ElementType,
  HistoryAttributes,
  TotalAttributeWithDistribution,
} from "./AttributeManager";
import { HISTORY_ATTRIBUTES } from "./AttributeManager";
import type { Formula } from "~/lib/engine/Formula";

type HistoryItemDealDamage = {
  type: "dealDamage";
  value: number;
  formula: Formula;
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
  teamAttributes?: Map<
    Creature,
    Map<
      HistoryAttributes,
      TotalAttributeWithDistribution | AttributeWithDistribution
    >
  >;
  enemyAttributes?: Map<
    HistoryAttributes,
    TotalAttributeWithDistribution | AttributeWithDistribution
  >;
};

export type PrettifiedActionForeground = {
  type: "foreground";
  caster: Creature | undefined;
  totalDmg: number;
  totalHeal: number;
  description: string;
  battleTime: number;
  formulas: Formula[];
  teamAttributes: Map<
    Creature,
    Map<
      HistoryAttributes,
      TotalAttributeWithDistribution | AttributeWithDistribution
    >
  >;
  enemyAttributes: Map<
    HistoryAttributes,
    TotalAttributeWithDistribution | AttributeWithDistribution
  >;
};

type PrettifiedActionBackground = {
  type: "background";
  caster: Creature | undefined;
  description: string;
  battleTime: number;
};

type PrettifiedActionBattleEnd = {
  type: "battleEnd";
  battleTime: number;
  damagePerCharPerType: Map<Creature, Map<DamageType | "allDamage", number>>;
};

export type PrettifiedActionType =
  | PrettifiedActionForeground
  | PrettifiedActionBackground
  | PrettifiedActionBattleEnd;

export class HistoryManager {
  private loggedActions: HistoryItemWithBattleTime[] = [];

  public constructor(private engine: Engine) {}

  // TODO: use subscriptions
  public add(historyItem: HistoryItem) {
    const loggedAction: HistoryItemWithBattleTime = {
      battleTime: this.engine.timeManager.getBattleTime(),
      ...historyItem,
    };
    if (loggedAction.type === "actionStart") {
      loggedAction.teamAttributes = new Map();
      this.engine.teamManager.getTeam().map((char) => {
        loggedAction.teamAttributes?.set(char, new Map());
        HISTORY_ATTRIBUTES.forEach((attr) => {
          const value = this.engine.attributeManager.getAttrWithDistribution(
            char,
            attr,
          );
          loggedAction.teamAttributes?.get(char)?.set(attr, value);
        });
      });

      loggedAction.enemyAttributes = new Map();
      const enemy = this.engine.getEnemy();
      HISTORY_ATTRIBUTES.forEach((attr) => {
        const value = this.engine.attributeManager.getAttrWithDistribution(
          enemy,
          attr,
        );
        loggedAction.enemyAttributes?.set(attr, value);
      });
    }
    this.loggedActions.push(loggedAction);
  }

  public getPrettified() {
    const result: PrettifiedActionType[] = [];
    let lastForegroundActionIndex = -1;
    let lastBackgroundActionIndex = -1;
    let totalDamagePerSkill: Map<
      Creature,
      Map<DamageType | "allDamage", number>
    > = new Map();
    this.loggedActions.forEach((loggedAction) => {
      switch (loggedAction.type) {
        case "actionStart": {
          if (!loggedAction.enemyAttributes || !loggedAction.teamAttributes) {
            throw new Error("no action start attributes");
          }

          result.push({
            battleTime: loggedAction.battleTime,
            type: "foreground",
            description: loggedAction.description,
            totalDmg: 0,
            totalHeal: 0,
            caster: loggedAction.caster,
            enemyAttributes: loggedAction.enemyAttributes,
            teamAttributes: loggedAction.teamAttributes,
            formulas: [],
          });
          lastForegroundActionIndex = result.length - 1;
          break;
        }
        case "actionEnd": {
          lastForegroundActionIndex = -1;
          break;
        }
        case "dealDamage": {
          if (!totalDamagePerSkill.has(loggedAction.caster)) {
            totalDamagePerSkill.set(loggedAction.caster, new Map());
          }

          const oldValueAllDamage =
            totalDamagePerSkill.get(loggedAction.caster)?.get("allDamage") ?? 0;
          totalDamagePerSkill
            .get(loggedAction.caster)
            ?.set("allDamage", oldValueAllDamage + loggedAction.value);

          const oldValue =
            totalDamagePerSkill
              .get(loggedAction.caster)
              ?.get(loggedAction.damageType) ?? 0;
          totalDamagePerSkill
            .get(loggedAction.caster)
            ?.set(loggedAction.damageType, oldValue + loggedAction.value);
          if (
            lastForegroundActionIndex === -1 ||
            !result[lastForegroundActionIndex]
          ) {
            return;
          }

          const previousLoggedAction = result[lastForegroundActionIndex];
          if (previousLoggedAction.type !== "foreground") {
            throw new Error("wrong previous logged action type");
          }

          previousLoggedAction.totalDmg += loggedAction.value;
          previousLoggedAction.formulas.push(loggedAction.formula);
          break;
        }
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
              : (result[
                  lastBackgroundActionIndex
                ] as PrettifiedActionBackground);
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
          break;
        default:
          break;
      }
    });

    result.push({
      type: "battleEnd",
      damagePerCharPerType: totalDamagePerSkill,
      battleTime: this.engine.timeManager.getBattleTime(),
    });
    return result;
  }
}
