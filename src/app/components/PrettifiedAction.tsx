import React from "react";
import type { PrettifiedActionType as PrettifiedActionType } from "~/lib/engine/HistoryManager";
import {
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { AttrWithDistribution } from "~/app/components/AttrWithDistribution";
import { FormulaViewer } from "~/app/components/FormulaViewer";

type Props = {
  action: PrettifiedActionType;
};

export function PrettifiedAction({ action }: Props) {
  const actionBattleTime = (action.battleTime / 1_000).toFixed(2);
  if (action.type === "foreground") {
    return (
      <AccordionItem>
        <AccordionButton paddingLeft={0}>
          <Heading size="md" textAlign="left">
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
        </AccordionButton>
        <AccordionPanel paddingLeft={0}>
          {action.formulas.map((formula, index) => (
            <div key={index}>
              <FormulaViewer formula={formula} />
            </div>
          ))}
          <Tabs>
            <TabList>
              {[...action.teamAttributes.keys()].map((creature) => (
                <Tab key={creature.name}>{creature.name}</Tab>
              ))}
              <Tab key="enemy">Enemy</Tab>
            </TabList>
            <TabPanels>
              {[...action.teamAttributes.entries()].map(
                ([creature, attributesMap]) => (
                  <TabPanel key={creature.name} paddingLeft={0}>
                    {[...attributesMap.values()].map((attrWithDistribution) => (
                      <AttrWithDistribution
                        key={attrWithDistribution.attr}
                        attrWithDistribution={attrWithDistribution}
                      />
                    ))}
                  </TabPanel>
                ),
              )}
            </TabPanels>
          </Tabs>
        </AccordionPanel>
      </AccordionItem>
    );
  } else if (action.type === "background") {
    return (
      <AccordionItem>
        <AccordionButton paddingLeft={0}>
          <Heading size="md" color="gray.400" textAlign="left">
            <Flex gap={2}>
              [{actionBattleTime}]
              <div>
                {action.description.split("\n").map((item, index, array) => (
                  <span key={item}>
                    {item}
                    {index == array.length - 1 ? "" : <br />}
                  </span>
                ))}
              </div>
            </Flex>
          </Heading>
        </AccordionButton>
      </AccordionItem>
    );
  }
}
