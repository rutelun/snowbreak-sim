import type { CharId } from "~/app/utils/pickers/constants";
import { ALLOWED_CHARS, getCharById } from "~/app/utils/pickers/constants";
import { useCallback, useId, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import type { CharInfo } from "~/app/components/Pickers/types";

type Props = {
  info: CharInfo | undefined;
  setInfo: (cb: (data: CharInfo | undefined) => CharInfo | undefined) => void;
};

export function CharPicker({ info, setInfo }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const onCharClick = useCallback(
    (locCharId: string) => {
      setInfo((draft: CharInfo | undefined) => {
        if (!draft) {
          draft = {
            id: locCharId as CharId,
            manifestation: 0,
            lvl: 80,
          };
        }

        draft.id = locCharId as CharId;

        return draft;
      });
      setIsOpen(false);
    },
    [setInfo],
  );

  const setManifestation = useCallback(
    (manifestation: 0 | 1 | 2 | 3 | 4 | 5) => {
      setInfo((draft: CharInfo | undefined) => {
        if (!draft) {
          return draft;
        }

        draft.manifestation = manifestation;
        return draft;
      });
    },
    [setInfo],
  );

  const chars = ALLOWED_CHARS;

  const manifestId = useId();
  const levelId = useId();

  const getImg = (charId: string) => `/chars/icons/${charId}.png`;
  return (
    <>
      {info?.id ? (
        <Box
          justifyContent="center"
          alignContent="center"
          display="flex"
          flexDirection="row"
          gap={1}
        >
          <Box sx={{ cursor: "pointer" }}>
            <img
              width="120px"
              height="120px"
              key={info.id}
              src={getImg(info.id)}
              onClick={() => setIsOpen(true)}
            />
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            flexDirection="column"
          >
            <Box>
              <Typography variant="h6">
                {getCharById(info.id)?.charName}{" "}
                {getCharById(info.id)?.charSubName}
              </Typography>
              <Typography>
                {getCharById(info.id)?.element}{" "}
                {getCharById(info.id)?.weaponType}
              </Typography>
            </Box>
            <Box>
              <FormControl>
                <InputLabel id={levelId}>Level</InputLabel>
                <Select
                  label="Level"
                  size="small"
                  labelId={levelId}
                  disabled
                  value={info.lvl}
                >
                  <MenuItem value={80}>80</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel
                  sx={{ backgroundColor: "white", paddingRight: 1 }}
                  id={manifestId}
                >
                  Manifestation
                </InputLabel>
                <Select
                  label="Manifestation"
                  size="small"
                  labelId={manifestId}
                  value={info.manifestation}
                  onChange={(e) =>
                    setManifestation(
                      Number(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5,
                    )
                  }
                  sx={{ width: "100px" }}
                >
                  {([0, 1, 2, 3, 4, 5] as const).map((manifest) => (
                    <MenuItem key={manifest} value={manifest}>
                      {manifest}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{ cursor: "pointer" }}
          width="114px"
          height="114px"
          justifyContent="center"
          alignContent="center"
          display="flex"
        >
          <Add
            sx={{ width: "114px", height: "114px" }}
            onClick={() => setIsOpen(true)}
          />
        </Box>
      )}

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogTitle>Choose character</DialogTitle>
        <DialogContent>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            {chars.map((char) => (
              <Box
                sx={{ cursor: "pointer" }}
                width="114px"
                flexDirection="column"
                justifyContent="center"
                textAlign="center"
                alignContent="center"
                key={char.id}
                onClick={() => onCharClick(char.id)}
                display="flex"
              >
                <img src={getImg(char.id)} />
                <Typography>{char.charName}</Typography>
                <Typography>{char.charSubName}</Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
