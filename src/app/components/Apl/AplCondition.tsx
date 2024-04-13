import { useAplContext } from "~/app/context/AplContext";
import { useCallback } from "react";
import { produce } from "immer";
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Close } from "@mui/icons-material";

type Props = {
  actionId: number;
  conditionId: number;
};
export function AplCondition({ actionId, conditionId }: Props) {
  const item = useAplContext(
    (c) => c.actionsWithConditions[actionId].conditions[conditionId],
  );
  const setActionsWithConditions = useAplContext(
    (c) => c.setActionsWithConditions,
  );
  const onChangeSelectValue = useCallback(
    (newValue: string) => {
      setActionsWithConditions((actions) =>
        produce(actions, (draft) => {
          const locCondition = draft[actionId].conditions[conditionId];
          if (locCondition.type === "select") {
            locCondition.currentValue = newValue !== "" ? newValue : undefined;
          }
        }),
      );
    },
    [actionId, conditionId, setActionsWithConditions],
  );

  const onChangeComparatorValue = useCallback(
    (newValue: string) => {
      setActionsWithConditions((actions) =>
        produce(actions, (draft) => {
          const locCondition = draft[actionId].conditions[conditionId];
          if (locCondition.type === "comparator") {
            locCondition.comparisonValue =
              newValue !== "" ? Number(newValue) : undefined;
          }
        }),
      );
    },
    [actionId, conditionId, setActionsWithConditions],
  );

  const onChangeComparatorValueType = useCallback(
    (newValue: "<=" | ">=") => {
      setActionsWithConditions((actions) =>
        produce(actions, (draft) => {
          const locCondition = draft[actionId].conditions[conditionId];
          if (locCondition.type === "comparator") {
            locCondition.comparisonType = newValue;
          }
        }),
      );
    },
    [actionId, conditionId, setActionsWithConditions],
  );
  const removeCondition = useCallback(() => {
    setActionsWithConditions((actions) =>
      produce(actions, (draft) => {
        draft[actionId].conditions.splice(conditionId, 1);
      }),
    );
  }, [actionId, conditionId, setActionsWithConditions]);
  const toggleCondition = useCallback(
    (enabled: boolean) => {
      setActionsWithConditions((actions) =>
        produce(actions, (draft) => {
          draft[actionId].conditions[conditionId].enabled = enabled;
        }),
      );
    },
    [actionId, conditionId, setActionsWithConditions],
  );

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={item.enabled}
              onChange={(e) => toggleCondition(e.target.checked)}
            />
          }
          label={`${item.description}`}
        />
        {item.type === "select" ? (
          <Select
            placeholder="Select"
            size="small"
            value={item.currentValue}
            onChange={(e) => onChangeSelectValue(e.target.value)}
          >
            {item.options.map((optionValue) => (
              <MenuItem value={optionValue} key={optionValue}>
                {optionValue}
              </MenuItem>
            ))}
          </Select>
        ) : null}
        {item.type === "comparator" ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "auto auto",
            }}
          >
            <Select
              size="small"
              value={item.comparisonType}
              onChange={(e) =>
                onChangeComparatorValueType(e.target.value as "<=" | ">=")
              }
            >
              {[">=", "<="].map((optionValue) => (
                <MenuItem value={optionValue} key={optionValue}>
                  {optionValue}
                </MenuItem>
              ))}
            </Select>
            <TextField
              sx={{ marginLeft: 1 }}
              size="small"
              type="number"
              value={item.comparisonValue ?? null}
              onChange={(e) => onChangeComparatorValue(e.target.value)}
            />
          </Box>
        ) : null}
        <Close
          onClick={removeCondition}
          sx={{ color: "red", marginLeft: 1 }}
          aria-label="remove condition"
        />
      </Box>
    </Box>
  );
}
