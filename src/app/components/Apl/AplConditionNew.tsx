import { useAplContext } from "~/app/context/AplContext";
import type { ChangeEvent } from "react";
import { useCallback, useRef } from "react";
import { Select } from "@chakra-ui/react";
import { produce } from "immer";

type Props = {
  actionId: number;
};
export function AplConditionNew({ actionId }: Props) {
  const possibleConditions = useAplContext((c) => c.possibleConditions);
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

    const condition = possibleConditions.find((item) => item.id === value);
    if (!condition) {
      return;
    }

    setActionsWithConditions((oldActions) => {
      return produce(oldActions, (draft) => {
        draft[actionId].conditions.push({ ...condition });
      });
    });
  }, []);

  return (
    <Select
      ref={ref}
      placeholder="Select condition"
      onChange={addAction}
      value={undefined}
      pt={2}
    >
      {possibleConditions.map((action) => (
        <option key={action.id} value={action.id}>
          {action.description}
        </option>
      ))}
    </Select>
  );
}
