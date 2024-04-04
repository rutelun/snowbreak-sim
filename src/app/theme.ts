import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light",
  colorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendTheme({ config });
