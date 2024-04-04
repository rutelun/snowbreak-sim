"use client";

import React from "react";
import { eatchelExample } from "~/lib/example/eatchel";
import { Accordion, Box, Container } from "@chakra-ui/react";
import { PrettifiedAction } from "~/app/components/PrettifiedAction";

const locActions = eatchelExample();
export default function Home() {
  return (
    <main>
      <Container maxW="2xl">
        <Box m={2} mx="auto">
          <Accordion allowMultiple>
            {locActions.map((action, index) => (
              <PrettifiedAction key={index} action={action} />
            ))}
          </Accordion>
        </Box>
      </Container>
    </main>
  );
}
