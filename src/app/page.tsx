"use client";

import React, { useEffect, useState } from "react";
import { eatchelExample } from "~/lib/example/eatchel";
import type { PrettifiedActionType } from "~/lib/engine/HistoryManager";
import { Accordion, Box, Container } from "@chakra-ui/react";
import { PrettifiedAction } from "~/app/components/PrettifiedAction";

export default function Home() {
  const [actions, setActions] = useState<PrettifiedActionType[]>([]);
  useEffect(() => setActions(eatchelExample()), []);

  return (
    <main>
      <Container maxW="2xl">
        <Box m={2} mx="auto">
          <Accordion allowMultiple>
            {actions.map((action, index) => (
              <PrettifiedAction key={index} action={action} />
            ))}
          </Accordion>
        </Box>
      </Container>
    </main>
  );
}
