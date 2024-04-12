import { useAplContext } from "~/app/context/AplContext";
import { AplActionWithConditions } from "~/app/components/Apl/AplActionWithConditions";
import { AplActionNew } from "~/app/components/Apl/AplActionNew";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

export function AplList() {
  const actionsWithConditions = useAplContext((c) => c.actionsWithConditions);
  return (
    <List>
      {actionsWithConditions.map((_item, index) => (
        <ListItem key={index} sx={{ display: "block" }}>
          <AplActionWithConditions actionId={index} />
        </ListItem>
      ))}
      <ListItem key="new" sx={{ display: "block" }}>
        <AplActionNew />
      </ListItem>
    </List>
  );
}
