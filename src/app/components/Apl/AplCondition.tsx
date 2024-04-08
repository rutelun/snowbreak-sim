import {
  Box,
  Checkbox,
  Grid,
  IconButton,
  Input,
  Select,
  Text,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useAplContext } from "~/app/context/AplContext";
import { useCallback } from "react";
import { produce } from "immer";

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
    [actionId, conditionId],
  );

  const onChangeComparatorValue = useCallback(
    (newValue: number) => {
      setActionsWithConditions((actions) =>
        produce(actions, (draft) => {
          const locCondition = draft[actionId].conditions[conditionId];
          if (locCondition.type === "comparator") {
            locCondition.comparisonValue = newValue;
          }
        }),
      );
    },
    [actionId, conditionId],
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
    [actionId, conditionId],
  );
  const removeCondition = useCallback(() => {
    setActionsWithConditions((actions) =>
      produce(actions, (draft) => {
        draft[actionId].conditions.splice(conditionId, 1);
      }),
    );
  }, [actionId, conditionId]);

  return (
    <Box pl={2}>
      <Grid templateColumns="auto 1fr auto">
        <Checkbox defaultChecked pt={1} pb={1}>
          <Text size="md" textAlign="left" width="max-content" pr={4}>
            {item.description}
          </Text>
        </Checkbox>
        {item.type === "select" ? (
          <Select
            placeholder="Select"
            size="sm"
            value={item.currentValue}
            onChange={(e) => onChangeSelectValue(e.target.value)}
          >
            {item.options.map((optionValue) => (
              <option value={optionValue} key={optionValue}>
                {optionValue}
              </option>
            ))}
          </Select>
        ) : null}
        {item.type === "comparator" ? (
          <Grid templateColumns="auto auto">
            <Select
              width="max-content"
              size="sm"
              value={item.comparisonType}
              onChange={(e) =>
                onChangeComparatorValueType(e.target.value as "<=" | ">=")
              }
            >
              {[">=", "<="].map((optionValue) => (
                <option value={optionValue} key={optionValue}>
                  {optionValue}
                </option>
              ))}
            </Select>
            <Input
              defaultValue={0}
              size="sm"
              type="number"
              value={item.comparisonValue}
              onChange={(e) => onChangeComparatorValue(Number(e.target.value))}
            />
          </Grid>
        ) : null}
        <IconButton
          onClick={removeCondition}
          justifySelf="flex-end"
          variant="ghost"
          isRound={true}
          colorScheme="red"
          aria-label="remove condition"
          icon={<CloseIcon />}
        />
      </Grid>
    </Box>
  );
}
