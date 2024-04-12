import {
  Autocomplete,
  Box,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  STATS_FOR_LOGISTICS,
  THIRD_STATS_FOR_LOGISTICS,
} from "~/app/utils/pickers/constants";
import type { Attribute } from "~/lib/engine/AttributeManager";
import { inArray } from "~/lib/utils/includes";

type AttrInfo =
  | {
      attr: Attribute;
      value: number;
    }
  | undefined;

export type Props = {
  type?: "usual" | "third";
  attrInfo: AttrInfo;
  setAttrInfo: (data: AttrInfo) => void;
  excludedAttributes: (Attribute | undefined)[];
};

export function LogisticStatPicker({
  type = "usual",
  attrInfo,
  setAttrInfo,
  excludedAttributes,
}: Props) {
  const possibleStats: Record<
    string,
    readonly [number, number, number, number, number]
  > = type === "usual" ? STATS_FOR_LOGISTICS : THIRD_STATS_FOR_LOGISTICS;

  const possibleAttributes = Object.keys(possibleStats).filter(
    (attr) => !inArray(excludedAttributes, attr) || attrInfo?.attr === attr,
  );

  const possibleStatsForAttr = attrInfo ? possibleStats[attrInfo.attr] : [];

  return (
    <Box marginBottom={1}>
      <Autocomplete
        sx={{
          flex: 1,
          "& .MuiInputBase-root": {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
        }}
        value={attrInfo?.attr}
        onChange={(_e, newValue) => {
          setAttrInfo({
            attr: newValue as Attribute,
            value: 0,
          });
        }}
        disableClearable
        size="small"
        renderInput={(params) => <TextField {...params} label="Attribute" />}
        options={possibleAttributes}
      />
      {!attrInfo ? null : (
        <ToggleButtonGroup
          sx={{
            display: "flex",
            borderRadius: 0,
            borderWidth: 0,
            borderRightWidth: 1,
            borderLeftWidth: 1,
            borderStyle: "solid",
            borderColor: "rgba(0, 0, 0, 0.23)",
          }}
          exclusive
          value={attrInfo.value}
          onChange={(_e, newValue) =>
            setAttrInfo({
              attr: attrInfo.attr,
              value: newValue,
            })
          }
        >
          {possibleStatsForAttr.map((statValue) => (
            <ToggleButton
              value={statValue}
              key={statValue}
              sx={{
                padding: 0,
                paddingLeft: 1,
                paddingRight: 1,
                flex: 1,
                borderTopWidth: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderColor: "rgba(0, 0, 0, 0.23)",
                "&:first-child": {
                  borderLeftWidth: 0,
                },
                "&:last-child": {
                  borderRightWidth: 0,
                },
              }}
            >
              {statValue}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}
    </Box>
  );
}
