import { AplList } from "~/app/components/Apl/AplList";
import { Accordion, Button } from "@chakra-ui/react";
import { PrettifiedAction } from "~/app/components/PrettifiedAction";
import React from "react";
import { useAplContext } from "~/app/context/AplContext";

export function PageContent() {
  const start = useAplContext((c) => c.start);
  const historyActions = useAplContext((c) => c.prettifiedActions);
  return (
    <>
      <AplList />
      <Button colorScheme="teal" onClick={() => start()} mt={2}>
        Start
      </Button>
      <Accordion allowMultiple>
        {historyActions.map((action, index) => (
          <PrettifiedAction key={index} action={action} />
        ))}
      </Accordion>
    </>
  );
}
