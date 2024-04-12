import { useAplContext } from "~/app/context/AplContext";
import { AplConditions } from "~/app/components/Apl/AplConditions";
import { useCallback, useState } from "react";
import { produce } from "immer";
import { Box, Stack, Checkbox, Button, FormControlLabel } from "@mui/material";
import { ArrowDownward, ArrowUpward, Close } from "@mui/icons-material";
type Props = {
  actionId: number;
};
export function AplActionWithConditions({ actionId }: Props) {
  const action = useAplContext((c) => c.actionsWithConditions[actionId].action);
  const setActionsWithConditions = useAplContext(
    (c) => c.setActionsWithConditions,
  );
  const totalActions = useAplContext((c) => c.actionsWithConditions.length);
  const hasConditions = useAplContext(
    (c) => c.actionsWithConditions[actionId].conditions.length,
  );

  const [isConditionsVisible, setIsConditionsVisible] =
    useState(!!hasConditions);

  const canMoveUp = actionId !== 0;
  const moveUpItem = useCallback(() => {
    if (!canMoveUp) {
      return;
    }

    setActionsWithConditions((value) =>
      produce(value, (draft) => {
        const prevValue = draft[actionId - 1];
        draft[actionId - 1] = draft[actionId];
        draft[actionId] = prevValue;
      }),
    );
  }, [canMoveUp, actionId]);

  const canMoveDown = actionId !== totalActions - 1;
  const moveDownItem = useCallback(() => {
    if (!canMoveDown) {
      return;
    }

    setActionsWithConditions((value) =>
      produce(value, (draft) => {
        const prevValue = draft[actionId + 1];
        draft[actionId + 1] = draft[actionId];
        draft[actionId] = prevValue;
      }),
    );
  }, [canMoveDown, actionId]);

  const deleteItem = useCallback(() => {
    setActionsWithConditions((value) =>
      produce(value, (draft) => {
        draft.splice(actionId, 1);
      }),
    );
  }, [canMoveDown, actionId]);

  return (
    <Box
      style={{
        borderWidth: 1,
        paddingLeft: 8,
        paddingBottom: isConditionsVisible ? 8 : 0,
      }}
    >
      <Stack
        useFlexGap
        justifyContent="space-between"
        flexDirection="row"
        alignItems="center"
        gap={2}
        sx={{ paddingRight: 1 }}
      >
        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label={`${action.description}
            ${isConditionsVisible ? " when(all true)" : ""}`}
        />
        <Box justifyContent="center" display="flex">
          <Button
            size="small"
            variant="text"
            onClick={() => setIsConditionsVisible((val) => !val)}
          >
            {isConditionsVisible ? "Hide" : "Change"} conditions
          </Button>

          <ArrowDownward
            onClick={moveDownItem}
            sx={{ color: canMoveDown ? "green" : "gray" }}
            aria-label="move down"
          />
          <ArrowUpward
            onClick={moveUpItem}
            sx={{ color: canMoveUp ? "green" : "gray" }}
            aria-label="move up"
          />
          <Close
            onClick={deleteItem}
            sx={{ color: "red" }}
            aria-label="emove condition"
          />
        </Box>
      </Stack>
      {isConditionsVisible ? <AplConditions actionId={actionId} /> : null}
    </Box>
  );
}
