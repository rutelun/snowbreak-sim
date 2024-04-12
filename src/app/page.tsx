"use client";

import React from "react";
import { AplContextWrapper } from "~/app/components/Apl/AplContextWrapper";
import { PageContent } from "~/app/PageContent";
import { Container } from "@mui/material";

export default function Home() {
  return (
    <main>
      <Container maxWidth="md">
        <AplContextWrapper>
          <PageContent />
        </AplContextWrapper>
      </Container>
    </main>
  );
}
