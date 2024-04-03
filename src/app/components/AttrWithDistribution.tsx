import type {
  AttributeWithDistribution,
  TotalAttributeWithDistribution,
} from "~/lib/engine/AttributeManager";
import {
  ALL_PERCENT_ATTRIBUTES,
  FINAL_DAMAGE_ATTRIBUTES,
  TOTAL_ATTRIBUTES,
} from "~/lib/engine/AttributeManager";
import { inArray } from "~/lib/utils/includes";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Heading,
  Text,
} from "@chakra-ui/react";
import React from "react";

type Props = {
  attrWithDistribution:
    | TotalAttributeWithDistribution
    | AttributeWithDistribution;
};

const check = (
  attrWithDistribution:
    | TotalAttributeWithDistribution
    | AttributeWithDistribution,
): attrWithDistribution is TotalAttributeWithDistribution =>
  inArray(TOTAL_ATTRIBUTES, attrWithDistribution.attr);
export function AttrWithDistribution({ attrWithDistribution }: Props) {
  if (check(attrWithDistribution)) {
    return (
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton>
            <Heading size="sm">
              {attrWithDistribution.attr}:{" "}
              {attrWithDistribution.value.toFixed(0)}
            </Heading>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Accordion allowMultiple paddingLeft={2}>
              {attrWithDistribution.innerAttrs.map((attr) => (
                <AccordionItem key={attr.attr}>
                  <AttrWithDistribution attrWithDistribution={attr} />
                </AccordionItem>
              ))}
            </Accordion>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  }

  const isPercentValue = inArray(
    ALL_PERCENT_ATTRIBUTES,
    attrWithDistribution.attr,
  );
  const value = isPercentValue
    ? attrWithDistribution.value * 100
    : attrWithDistribution.value;

  if (
    (inArray(FINAL_DAMAGE_ATTRIBUTES, attrWithDistribution.attr) &&
      value === 100) ||
    value === 0
  ) {
    return null;
  }

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <AccordionButton>
          <Heading size="sm">
            {attrWithDistribution.attr}: {value.toFixed(2)}
          </Heading>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <Accordion marginTop={0} marginBottom={0}>
            {attrWithDistribution.valueDistribution.map(
              (attrDistributionPart) => (
                <AccordionItem
                  key={attrDistributionPart.description}
                  marginTop={0}
                  marginBottom={0}
                >
                  <Text size="sm" paddingLeft={2}>
                    {attrDistributionPart.value.toFixed(2)}(
                    {attrDistributionPart.description})
                  </Text>
                </AccordionItem>
              ),
            )}
          </Accordion>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
