import type {
  AplActionWithConditions,
  AplActionWithConditionsUi,
  AplCondition,
} from "~/app/apl/types";
import { buildPossibleAplConditions } from "~/app/apl/conditions/buildPossibleAplConditions";
import { buildPossibleActions } from "~/app/apl/actions/buildPossibleActions";
import type { FullCharInfo } from "~/app/components/Pickers/types";
import { Engine } from "~/lib/engine/Engine";
import {
  getCharById,
  getLogisticsById,
  getWeaponById,
} from "~/app/utils/pickers/constants";
import type { AttributesObj } from "~/lib/engine/AttributeManager";

type Props = {
  expectedBattleTime: number;
  apl: AplActionWithConditionsUi[];
  charsInfo: FullCharInfo[];
};

export function runApl({ expectedBattleTime, charsInfo, apl }: Props): Engine {
  const possibleConditions = buildPossibleAplConditions(charsInfo);
  const possibleConditionsMap = new Map(
    possibleConditions.map((item) => [item.id, item]),
  );
  const possibleActions = buildPossibleActions(charsInfo);
  const possibleActionsMap = new Map(
    possibleActions.map((item) => [item.id, item]),
  );

  const engine = new Engine();
  charsInfo.forEach((info) => {
    if (!info.char) {
      return;
    }

    const Char = getCharById(info.char.id);
    if (!Char) {
      return;
    }

    const char = new Char(engine, {
      lvl: info.char.lvl,
      manifestation: info.char.manifestation,
    });

    if (info.weapon) {
      const Weapon = getWeaponById(info.weapon?.name);
      if (Weapon) {
        const weapon = new Weapon(engine, {
          lvl: info.weapon.lvl,
          tier: info.weapon.tier,
        });
        char.equipWeapon(weapon);
      }
    }

    if (info.logistics && info.logistics?.name) {
      const LogisticSet = getLogisticsById(info.logistics?.name);
      if (LogisticSet) {
        const totalPartsStat = info.logistics.parts.reduce((res, part) => {
          part.map((smallPart) => {
            if (smallPart) {
              res[smallPart.attr] =
                (res[smallPart.attr] ?? 0) + smallPart.value;
            }
          });
          return res;
        }, {} as AttributesObj);
        const logisticSet = new LogisticSet(engine, [totalPartsStat]);
        char.equipLogistics(logisticSet);
      }
    }
  });

  engine.timeManager.startBattle();

  const aplInitialized: AplActionWithConditions[] = [];
  apl.forEach((item) => {
    const mapAction = possibleActionsMap.get(item.action.id);
    if (!mapAction || !item.action.enabled) {
      return;
    }

    const conditions: AplCondition[] = [];
    item.conditions.forEach((condition) => {
      const mapCondition = possibleConditionsMap.get(condition.id);
      if (
        !mapCondition ||
        mapCondition.type !== condition.type ||
        !condition.enabled
      ) {
        return;
      }

      if (mapCondition.type === "select" && condition.type === "select") {
        conditions.push({
          ...mapCondition,
          ...condition,
        });
      } else if (
        mapCondition.type === "comparator" &&
        condition.type === "comparator"
      ) {
        conditions.push({
          ...mapCondition,
          ...condition,
        });
      }
    });

    aplInitialized.push({
      conditions,
      action: mapAction,
    });
  });

  while (engine.timeManager.getBattleTime() <= expectedBattleTime) {
    const actionToExecute = aplInitialized.find(
      (action) =>
        (action.action.check?.(engine) ?? true) &&
        !action.conditions.find((locAction) => {
          if (locAction.type === "select" && locAction.currentValue) {
            return !locAction.check(engine, locAction.currentValue);
          }
          if (locAction.type === "comparator") {
            const comparators = {
              ">=": (a: number, b: number | undefined) => a >= (b ?? 0),
              "<=": (a: number, b: number | undefined) => a <= (b ?? 0),
            };
            return !comparators[locAction.comparisonType](
              locAction.getValue(engine),
              locAction.comparisonValue,
            );
          }
        }),
    );
    if (!actionToExecute) {
      engine.timeManager.doAction({
        action: () => {},
        caster: undefined,
        duration: 1000,
        isDurationConfirmed: true,
        description: "No possible action, waiting 1 second",
      });
    } else {
      actionToExecute.action.action(engine);
    }
  }

  return engine;
}
