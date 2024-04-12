"use client";

import React from "react";
import { eatchelExample } from "~/lib/example/eatchel";
import { AplContextWrapper } from "~/app/components/Apl/AplContextWrapper";
import { PageContent } from "~/app/PageContent";
import { CharPicker } from "~/app/components/Pickers/CharPicker";
import { Container, Typography } from "@mui/material";

const engine = eatchelExample();
export default function Home() {
  return (
    <main>
      <Container maxWidth="md">
        <CharPicker />
        <Typography>Eatchel M0 80lvl with Blitzing Fangs T2 80lvl</Typography>
        <Typography>
          Logistics: Amano-Iwato x3 atk%8.5 x3 critDmg 9 x3 kineticDmg% 7.2
        </Typography>
        <Typography>Kaguya M0 80lvl with Prismatic Igniter T1 80lvl</Typography>
        <Typography>
          Logistics: Amarna x3 atk%8.5 x2 sRecovery 12 x1 skillHaste 16.4
        </Typography>
        <Typography>
          LittleSunshine M1 80lvl with Strawberry Shortcake T1 80lvl
        </Typography>
        <Typography>
          Logistics: Amarna(yep i know it doesnt work, but lazy to make other
          set) x3 atk%8.5 x3 sRecovery 12 x3 thermalDmg 7.2
        </Typography>
        <Typography>
          Always hit weakpoint, enemy damages you every 3 second
        </Typography>
        <AplContextWrapper engine={engine}>
          <PageContent />
        </AplContextWrapper>
      </Container>
    </main>
  );
}
