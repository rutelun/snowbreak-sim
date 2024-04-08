import { useAplContext } from "~/app/context/AplContext";
import { List, ListItem } from "@chakra-ui/react";
import { AplActionWithConditions } from "~/app/components/Apl/AplActionWithConditions";
import { AplActionNew } from "~/app/components/Apl/AplActionNew";

export function AplList() {
  const actionsWithConditions = useAplContext((c) => c.actionsWithConditions);
  return (
    <List>
      <ListItem>
        {actionsWithConditions.map((_item, index) => (
          <AplActionWithConditions key={index} actionId={index} />
        ))}
        <AplActionNew />
      </ListItem>
    </List>
  );
}
