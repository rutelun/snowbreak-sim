import { Box } from "@mui/material";
import { CharPicker } from "~/app/components/Pickers/CharPicker";
import { WeaponPicker } from "~/app/components/Pickers/WeaponPicker";
import React from "react";
import { LogisticPicker } from "~/app/components/Pickers/LogisticPicker";
import { produce } from "immer";
import { getCharById } from "~/app/utils/pickers/constants";
import { useAplContext } from "~/app/context/AplContext";

type Props = {
  index: number;
};
export function FullCharPicker({ index }: Props) {
  const info = useAplContext((c) => c.charsInfo[index]);
  const setCharsInfo = useAplContext((c) => c.setCharsInfo);

  const char = info?.char?.id ? getCharById(info?.char?.id) : undefined;
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          marginBottom: 2,
          height: "120px",
        }}
      >
        <CharPicker
          info={info?.char}
          setInfo={(data) =>
            setCharsInfo((oldInfo) =>
              produce(oldInfo, (draft) => {
                if (!draft[index]) {
                  draft[index] = {
                    char: undefined,
                    weapon: undefined,
                    logistics: undefined,
                  };
                }
                draft[index].char = data(draft[index].char);
              }),
            )
          }
        />
        {char ? (
          <WeaponPicker
            type={char?.weaponType}
            info={info?.weapon}
            setInfo={(data) =>
              setCharsInfo((oldInfo) =>
                produce(oldInfo, (draft) => {
                  if (!draft[index]) {
                    draft[index] = {
                      char: undefined,
                      weapon: undefined,
                      logistics: undefined,
                    };
                  }
                  draft[index].weapon = data(draft[index].weapon);
                }),
              )
            }
          />
        ) : null}
      </Box>
      <LogisticPicker
        info={info?.logistics}
        setInfo={(data) =>
          setCharsInfo((oldInfo) =>
            produce(oldInfo, (draft) => {
              if (!draft[index]) {
                draft[index] = {
                  char: undefined,
                  weapon: undefined,
                  logistics: undefined,
                };
              }
              draft[index].logistics = data(draft[index].logistics);
            }),
          )
        }
      />
    </Box>
  );
}
