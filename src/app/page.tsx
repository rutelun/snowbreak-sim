"use client";

import React from "react";
import { eatchelExample } from "~/lib/example/eatchel";
import { Accordion, Box, Container, Text } from "@chakra-ui/react";
import { PrettifiedAction } from "~/app/components/PrettifiedAction";
import { Amarna } from "~/lib/logistics/Amarna";

const locActions = eatchelExample();
export default function Home() {
  return (
    <main>
      <Container maxW="2xl">
        <Box m={2} mx="auto">
          <Text>Eatchel M0 80lvl with Blitzing Fangs T2 80lvl</Text>
          <Text pl={2}>
            Logistics: Amano-Iwato x3 atk%8.5 x3 critDmg 9 x3 kineticDmg% 7.2
          </Text>
          <Text>Kaguya M0 80lvl with Prismatic Igniter T1 80lvl</Text>
          <Text pl={2}>
            Logistics: Amarna x3 atk%8.5 x2 sRecovery 12 x1 skillHaste 16.4
          </Text>
          <Text>
            LittleSunshine M1 80lvl with Strawberry Shortcake T1 80lvl
          </Text>
          <Text pl={2}>
            Logistics: Amarna(yep i know it doesnt work, but lazy to make other
            set) x3 atk%8.5 x3 sRecovery 12 x3 thermalDmg 7.2
          </Text>
          <Text>Always hit weakpoint, enemy damages you every 3 second</Text>
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
