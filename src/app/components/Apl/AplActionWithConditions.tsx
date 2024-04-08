import { useAplContext } from "~/app/context/AplContext";
import { AplConditions } from "~/app/components/Apl/AplConditions";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, CloseIcon } from "@chakra-ui/icons";
import { produce } from "immer";

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
    <Box borderWidth={1} pl={2} pb={isConditionsVisible ? 2 : 0}>
      <Flex justifyContent="space-between">
        <Checkbox defaultChecked pt={1} pb={1}>
          <Text size="md" textAlign="left">
            {action.description}
            {isConditionsVisible ? " when(all true)" : ""}
          </Text>
        </Checkbox>
        <Box>
          <Button
            size="sm"
            rounded="inherit"
            onClick={() => setIsConditionsVisible((val) => !val)}
          >
            {isConditionsVisible ? "Hide" : "Change"} conditions
          </Button>
          <IconButton
            onClick={moveDownItem}
            disabled={!canMoveDown}
            justifySelf="flex-end"
            variant="ghost"
            colorScheme={canMoveDown ? "green" : "gray"}
            aria-label="move down"
            minWidth={6}
            icon={<ArrowDownIcon boxSize={[5, 5]} />}
          />
          <IconButton
            onClick={moveUpItem}
            disabled={!canMoveUp}
            justifySelf="flex-end"
            variant="ghost"
            colorScheme={canMoveUp ? "green" : "gray"}
            aria-label="move up"
            minWidth={6}
            icon={<ArrowUpIcon boxSize={[5, 5]} />}
          />
          <IconButton
            onClick={deleteItem}
            justifySelf="flex-end"
            variant="ghost"
            colorScheme="red"
            aria-label="remove condition"
            icon={<CloseIcon />}
          />
        </Box>
      </Flex>
      {isConditionsVisible ? <AplConditions actionId={actionId} /> : null}
    </Box>
  );
}
