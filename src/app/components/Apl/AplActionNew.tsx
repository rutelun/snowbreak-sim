import { useAplContext } from "~/app/context/AplContext";
import { useCallback, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

export function AplActionNew() {
  const possibleActions = useAplContext((c) => c.possibleActions);
  const setActionsWithConditions = useAplContext(
    (c) => c.setActionsWithConditions,
  );

  const [key, setKey] = useState(0);

  const addAction = useCallback((value: unknown) => {
    if (value === "" || !value) {
      return;
    }

    const action = possibleActions.find((item) => item.id === value);
    if (!action) {
      return;
    }

    setKey((locKey) => locKey + 1);

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
    <Autocomplete
      id="apl-action-new"
      size="small"
      key={key}
      renderInput={(params) => <TextField {...params} label="Action" />}
      onChange={(_, newValue) => addAction(newValue?.id)}
      getOptionLabel={(option) => option.description}
      options={possibleActions}
    />
  );
}
