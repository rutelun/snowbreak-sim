import { useAplContext } from "~/app/context/AplContext";
import { AplConditionNew } from "~/app/components/Apl/AplConditionNew";
import { AplCondition } from "~/app/components/Apl/AplCondition";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

type Props = {
  actionId: number;
};

export function AplConditions({ actionId }: Props) {
  const conditions = useAplContext(
    (c) => c.actionsWithConditions[actionId].conditions,
  );

  return (
    <List>
      <ListItem sx={{ display: "block" }}>
        {conditions.map((_condition, index) => (
          <AplCondition actionId={actionId} conditionId={index} key={index} />
        ))}
        <AplConditionNew actionId={actionId} />
      </ListItem>
    </List>
  );
}
