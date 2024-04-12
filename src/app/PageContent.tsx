import { AplList } from "~/app/components/Apl/AplList";
import { PrettifiedAction } from "~/app/components/PrettifiedAction";
import React from "react";
import { useAplContext } from "~/app/context/AplContext";
import { Button } from "@mui/material";
import { FullCharPicker } from "~/app/components/Pickers/FullCharPicker";

export function PageContent() {
  const start = useAplContext((c) => c.start);
  const historyActions = useAplContext((c) => c.prettifiedActions);
  return (
    <>
      <FullCharPicker index={0} />
      <FullCharPicker index={1} />
      <FullCharPicker index={2} />
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
