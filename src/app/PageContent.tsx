import { AplList } from "~/app/components/Apl/AplList";
import { PrettifiedAction } from "~/app/components/PrettifiedAction";
import React from "react";
import { useAplContext } from "~/app/context/AplContext";
import { Button } from "@mui/material";

export function PageContent() {
  const start = useAplContext((c) => c.start);
  const historyActions = useAplContext((c) => c.prettifiedActions);
  return (
    <>
      <AplList />
      <Button variant="contained" onClick={() => start()}>
        Start
      </Button>
      {historyActions.map((action, index) => (
        <PrettifiedAction key={index} action={action} />
      ))}
    </>
  );
}
