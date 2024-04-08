import type { Engine } from "~/lib/engine/Engine";
import type { FC, PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buildPossibleActions } from "~/app/apl/actions/buildPossibleActions";
import { buildPossibleAplConditions } from "~/app/apl/conditions/buildPossibleAplConditions";
import type {
  AplActionUi,
  AplActionWithConditionsUi,
  AplConditionUi,
} from "~/app/apl/types";
import type { AplContextType } from "~/app/context/AplContext";
import { AplContext } from "~/app/context/AplContext";
import type { PrettifiedActionType } from "~/lib/engine/HistoryManager";
import { runApl } from "~/app/apl/runApl";

type Props = {
  engine: Engine;
};
export const AplContextWrapper: FC<PropsWithChildren<Props>> = ({
  engine,
  children,
}) => {
  const possibleActions: AplActionUi[] = useMemo(
    () =>
      buildPossibleActions(engine).map((action) => ({
        ...action,
        enabled: true,
      })),
    [engine],
  );
  const possibleConditions = useMemo(() => {
    return buildPossibleAplConditions(engine).map(
      (condition): AplConditionUi => {
        if (condition.type === "select") {
          return {
            description: condition.description,
            id: condition.id,
            type: condition.type,
            options: condition.options,
            currentValue: undefined,
            enabled: true,
          };
        }
        if (condition.type === "comparator") {
          return {
            description: condition.description,
            id: condition.id,
            type: condition.type,
            comparisonType: ">=",
            comparisonValue: 0,
            enabled: true,
          };
        }
        throw new Error("unknown type");
      },
    );
  }, [engine]);

  const [actionsWithConditions, setActionsWithConditions] = useState<
    AplActionWithConditionsUi[]
  >(() => {
    const localStorageValue = localStorage.getItem("actionsWithConditions");
    if (!localStorageValue) {
      return [];
    }

    return JSON.parse(localStorageValue);
  });

  useEffect(() => {
    localStorage.setItem(
      "actionsWithConditions",
      JSON.stringify(actionsWithConditions),
    );
  }, [actionsWithConditions]);

  const [prettifiedActions, setPrettifiedActions] = useState<
    PrettifiedActionType[]
  >([]);

  const start = useCallback(() => {
    engine.timeManager.startBattle();
    runApl({ engine, apl: actionsWithConditions, expectedBattleTime: 60_000 });
    setPrettifiedActions(engine.historyManager.getPrettified());
  }, [engine, actionsWithConditions]);

  const contextData: AplContextType = useMemo(
    () => ({
      possibleConditions,
      possibleActions,
      actionsWithConditions,
      setActionsWithConditions,
      start,
      prettifiedActions,
    }),
    [
      possibleActions,
      possibleConditions,
      actionsWithConditions,
      setActionsWithConditions,
      start,
      prettifiedActions,
    ],
  );

  return (
    <AplContext.Provider value={contextData}>{children}</AplContext.Provider>
  );
};
