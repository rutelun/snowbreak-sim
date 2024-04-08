import { useAplContext } from "~/app/context/AplContext";
import { List, ListItem } from "@chakra-ui/react";
import { AplConditionNew } from "~/app/components/Apl/AplConditionNew";
import { AplCondition } from "~/app/components/Apl/AplCondition";

type Props = {
  actionId: number;
};

export function AplConditions({ actionId }: Props) {
  const conditions = useAplContext(
    (c) => c.actionsWithConditions[actionId].conditions,
  );

  return (
    <List spacing={2} pl={2}>
      <ListItem>
        {conditions.map((_condition, index) => (
          <AplCondition actionId={actionId} conditionId={index} key={index} />
        ))}
        <AplConditionNew actionId={actionId} />
      </ListItem>
    </List>
  );
}
