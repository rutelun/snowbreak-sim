import type {
  AplActionUi,
  AplActionWithConditionsUi,
  AplConditionUi,
} from "~/app/apl/types";
import { createContext, useContextSelector } from "use-context-selector";
import type { PrettifiedActionType } from "~/lib/engine/HistoryManager";

export type AplContextType = {
  possibleConditions: AplConditionUi[];
  possibleActions: AplActionUi[];
  actionsWithConditions: AplActionWithConditionsUi[];
  setActionsWithConditions: (
    setter: (
      oldValue: AplActionWithConditionsUi[],
    ) => AplActionWithConditionsUi[],
  ) => void;
  prettifiedActions: PrettifiedActionType[];
  start: () => void;
};

export const AplContext = createContext<AplContextType | undefined>(undefined);

interface AplContextSelector {
  <T>(selector: (data: AplContextType) => T): T;

  (): AplContextType;
}

export const useAplContext: AplContextSelector = ((selector) => {
  return useContextSelector(AplContext, (data) => {
    if (!data) throw new Error("Empty AplContext");
    return selector ? selector(data) : data;
  });
}) as AplContextSelector;
