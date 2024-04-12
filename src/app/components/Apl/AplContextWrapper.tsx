"use client";
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
import type { FullCharInfo } from "~/app/components/Pickers/types";

export const AplContextWrapper: FC<PropsWithChildren> = ({ children }) => {
  const [charsInfo, setCharsInfo] = useState<FullCharInfo[]>(() => {
    if (!window) {
      return [];
    }

    const localStorageValue = window.localStorage.getItem("charsInfo");
    if (!localStorageValue) {
      return [];
    }

    return JSON.parse(localStorageValue);
  });

  useEffect(() => {
    window.localStorage.setItem("charsInfo", JSON.stringify(charsInfo));
  }, [charsInfo]);

  const possibleActions: AplActionUi[] = useMemo(
    () =>
      buildPossibleActions(charsInfo).map((action) => ({
        ...action,
        enabled: true,
      })),
    [charsInfo],
  );
  const possibleConditions = useMemo(() => {
    return buildPossibleAplConditions(charsInfo).map(
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
  }, [charsInfo]);

  const [actionsWithConditions, setActionsWithConditions] = useState<
    AplActionWithConditionsUi[]
  >(() => {
    if (!window) {
      return [];
    }

    const localStorageValue = window.localStorage.getItem(
      "actionsWithConditions",
    );
    if (!localStorageValue) {
      return [];
    }

    return JSON.parse(localStorageValue);
  });

  useEffect(() => {
    window.localStorage.setItem(
      "actionsWithConditions",
      JSON.stringify(actionsWithConditions),
    );
  }, [actionsWithConditions]);

  const [prettifiedActions, setPrettifiedActions] = useState<
    PrettifiedActionType[]
  >([]);

  const start = useCallback(() => {
    const engine = runApl({
      charsInfo,
      apl: actionsWithConditions,
      expectedBattleTime: 60_000,
    });
    setPrettifiedActions(engine.historyManager.getPrettified());
  }, [charsInfo, actionsWithConditions]);

  const contextData: AplContextType = useMemo(
    () => ({
      possibleConditions,
      possibleActions,
      actionsWithConditions,
      setActionsWithConditions,
      start,
      prettifiedActions,
      charsInfo,
      setCharsInfo,
    }),
    [
      possibleActions,
      possibleConditions,
      actionsWithConditions,
      setActionsWithConditions,
      charsInfo,
      setCharsInfo,
      start,
      prettifiedActions,
    ],
  );

  return (
    <AplContext.Provider value={contextData}>{children}</AplContext.Provider>
  );
};
