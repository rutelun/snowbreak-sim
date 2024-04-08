import { useAplContext } from "~/app/context/AplContext";
import type { ChangeEvent } from "react";
import { useCallback, useRef } from "react";
import { Select } from "@chakra-ui/react";

export function AplActionNew() {
  const possibleActions = useAplContext((c) => c.possibleActions);
  const setActionsWithConditions = useAplContext(
    (c) => c.setActionsWithConditions,
  );

  const ref = useRef<HTMLSelectElement>(null);
  const addAction = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "") {
      return;
    }

    const refValue = ref.current;
    if (refValue) {
      refValue.value = "";
    }

    const action = possibleActions.find((item) => item.id === value);
    if (!action) {
      return;
    }

    setActionsWithConditions((oldActions) => {
      return [
        ...oldActions,
        {
          action: { ...action },
          conditions: [],
        },
      ];
    });
  }, []);

  return (
    <Select
      ref={ref}
      placeholder="Select action"
      onChange={addAction}
      value={undefined}
      pt={2}
    >
      {possibleActions.map((action) => (
        <option key={action.id} value={action.id}>
          {action.description}
        </option>
      ))}
    </Select>
  );
}
