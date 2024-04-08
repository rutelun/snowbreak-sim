import type {
  AplActionWithConditions,
  AplActionWithConditionsUi,
  AplCondition,
} from "~/app/apl/types";
import type { Engine } from "~/lib/engine/Engine";
import { buildPossibleAplConditions } from "~/app/apl/conditions/buildPossibleAplConditions";
import { buildPossibleActions } from "~/app/apl/actions/buildPossibleActions";

type Props = {
  expectedBattleTime: number;
  apl: AplActionWithConditionsUi[];
  engine: Engine;
};

export function runApl({ expectedBattleTime, engine, apl }: Props) {
  const possibleConditions = buildPossibleAplConditions(engine);
  const possibleConditionsMap = new Map(
    possibleConditions.map((item) => [item.id, item]),
  );
  const possibleActions = buildPossibleActions(engine);
  const possibleActionsMap = new Map(
    possibleActions.map((item) => [item.id, item]),
  );

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
        (action.action.check?.() ?? true) &&
        !action.conditions.find((locAction) => {
          if (locAction.type === "select" && locAction.currentValue) {
            return !locAction.check(locAction.currentValue);
          }
          if (locAction.type === "comparator") {
            const comparators = {
              ">=": (a: number, b: number) => a >= b,
              "<=": (a: number, b: number) => a <= b,
            };
            return !comparators[locAction.comparisonType](
              locAction.getValue(),
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
      actionToExecute.action.action();
    }
  }
}
