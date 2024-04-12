import { useAplContext } from "~/app/context/AplContext";
import { useCallback, useState } from "react";
import { produce } from "immer";
import { Autocomplete, TextField } from "@mui/material";

type Props = {
  actionId: number;
};
export function AplConditionNew({ actionId }: Props) {
  const possibleConditions = useAplContext((c) => c.possibleConditions);
  const setActionsWithConditions = useAplContext(
    (c) => c.setActionsWithConditions,
  );

  const [key, setKey] = useState(0);
  const addAction = useCallback((value: string | undefined) => {
    setKey((locKey) => locKey + 1);

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
    <Autocomplete
      id="apl-action-new"
      size="small"
      key={key}
      renderInput={(params) => <TextField {...params} label="Action" />}
      onChange={(_, newValue) => addAction(newValue?.id)}
      getOptionLabel={(option) => option.description}
      options={possibleConditions}
    />
  );
}
