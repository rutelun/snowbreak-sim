"use client";

import React, { useEffect, useState } from "react";
import { eatchelExample } from "~/lib/example/eatchel";
import type { PrettifiedActionType } from "~/lib/engine/HistoryManager";
import { Accordion, Box } from "@chakra-ui/react";
import { PrettifiedAction } from "~/app/components/PrettifiedAction";

export default function Home() {
  const [actions, setActions] = useState<PrettifiedActionType[]>([]);
  useEffect(() => setActions(eatchelExample()), []);

  return (
    <main>
      <Box boxSize="m">
        <Accordion allowToggle allowMultiple>
          {actions.map((action, index) => (
            <PrettifiedAction key={index} action={action} />
          ))}
        </Accordion>
      </Box>
    </main>
  );
}
