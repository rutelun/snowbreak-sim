import React from "react";
import type { PrettifiedActionType as PrettifiedActionType } from "~/lib/engine/HistoryManager";
import { AccordionItem, Flex, Heading } from "@chakra-ui/react";

type Props = {
  action: PrettifiedActionType;
};

export function PrettifiedAction({ action }: Props) {
  const actionBattleTime = (action.battleTime / 1_000).toFixed(2);
  if (action.type === "foreground") {
    return (
      <AccordionItem>
        <Heading size="md">
          <Flex gap={2}>
            [{actionBattleTime}]
            <div>
              {action.description}&nbsp;
              {action.totalDmg > 0
                ? `[TotalDmg: ${action.totalDmg.toFixed(0)}] `
                : ""}
              {action.totalHeal > 0
                ? `[TotalHeal: ${action.totalHeal.toFixed(0)}]`
                : ""}
            </div>
          </Flex>
        </Heading>
      </AccordionItem>
    );
  } else if (action.type === "background") {
    return (
      <AccordionItem>
        <Heading size="md" color="gray.400">
          <Flex gap={2}>
            [{actionBattleTime}]
            <div>
              {action.description.split("\n").map((item, index, array) => (
                <>
                  {item}
                  {index == array.length - 1 ? "" : <br />}
                </>
              ))}
            </div>
          </Flex>
        </Heading>
      </AccordionItem>
    );
  }
}
