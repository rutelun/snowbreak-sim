"use client";

import React from "react";
import { AplContextWrapper } from "~/app/components/Apl/AplContextWrapper";
import { PageContent } from "~/app/PageContent";
import { Container, useTheme } from "@mui/material";

export default function Home() {
  const theme = useTheme();
  return (
    <main>
      <Container
        maxWidth="md"
        sx={{ [theme.breakpoints.up("sm")]: { maxWidth: "741px" } }}
      >
        <AplContextWrapper>
          <PageContent />
        </AplContextWrapper>
      </Container>
    </main>
  );
}
