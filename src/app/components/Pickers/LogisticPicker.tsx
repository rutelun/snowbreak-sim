import { Autocomplete, Box, TextField } from "@mui/material";
import type { LogisticSetName } from "~/app/utils/pickers/constants";
import { ALLOWED_LOGISTICS_NAMES } from "~/app/utils/pickers/constants";
import { LogisticStatPicker } from "~/app/components/Pickers/LogisticStatPicker";
import type {
  LogisticAttrWithValue,
  LogisticInfo,
} from "~/app/components/Pickers/types";

type Props = {
  info: LogisticInfo | undefined;
  setInfo: (
    cb: (data: LogisticInfo | undefined) => LogisticInfo | undefined,
  ) => void;
};

export function LogisticPicker({ info, setInfo }: Props) {
  const setLogisStats = (
    partIndex: number,
    attrIndex: number,
    attrInfo: LogisticAttrWithValue,
  ) => {
    setInfo((draft) => {
      if (!draft) {
        draft = {
          parts: [
            [undefined, undefined, undefined],
            [undefined, undefined, undefined],
            [undefined, undefined, undefined],
          ],
          name: undefined,
        };
      }
      draft.parts[partIndex][attrIndex] = attrInfo;
      return draft;
    });
  };

  const setName = (name: LogisticSetName) => {
    setInfo((draft) => {
      if (!draft) {
        draft = {
          parts: [
            [undefined, undefined, undefined],
            [undefined, undefined, undefined],
            [undefined, undefined, undefined],
          ],
          name: undefined,
        };
      }
      draft.name = name;
      return draft;
    });
  };

  return (
    <Box width="max-content">
      <Autocomplete
        size="small"
        value={info?.name}
        onChange={(_e, newValue) => setName(newValue as LogisticSetName)}
        renderInput={(params) => <TextField {...params} label="Logistic Set" />}
        options={ALLOWED_LOGISTICS_NAMES}
      />
      <Box
        flexDirection="row"
        display="flex"
        gap={2}
        marginTop={2}
        width="max-content"
      >
        {[0, 1, 2].map((locPartIndex) => (
          <Box
            key={locPartIndex}
            flexDirection="column"
            display="flex"
            minWidth="220px"
          >
            {[0, 1, 2].map((logIndex) => (
              <LogisticStatPicker
                key={logIndex}
                type={logIndex === 2 ? "third" : "usual"}
                attrInfo={info?.parts[locPartIndex][logIndex]}
                excludedAttributes={
                  info?.parts[locPartIndex].map((item) => item?.attr) ?? []
                }
                setAttrInfo={(locAttrInfo) =>
                  setLogisStats(locPartIndex, logIndex, locAttrInfo)
                }
              />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
