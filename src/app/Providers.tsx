"use client";

import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { theme } from "~/app/theme";
import { THEME_ID, ThemeProvider } from "@mui/material/styles";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={{ [THEME_ID]: theme }}>{children}</ThemeProvider>
    </AppRouterCacheProvider>
  );
}
