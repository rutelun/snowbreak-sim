import { ALLOWED_CHARS, getCharById } from "~/app/utils/pickers/constants";
import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";

export function CharPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [chosenCharId, setChosenCharId] = useState<string | undefined>(
    undefined,
  );

  const onCharClick = useCallback((locCharId: string) => {
    setChosenCharId(locCharId);
    setIsOpen(false);
  }, []);

  const chars = ALLOWED_CHARS;

  const getImg = (charId: string) => `/chars/icons/${charId}.png`;
  return (
    <>
      {chosenCharId ? (
        <Box
          width="114px"
          justifyContent="center"
          alignContent="center"
          display="flex"
          flexDirection="column"
        >
          <Box sx={{ cursor: "pointer" }}>
            <img
              key={chosenCharId}
              src={getImg(chosenCharId)}
              onClick={() => setIsOpen(true)}
            />
          </Box>
          <Typography textAlign="center">
            {getCharById(chosenCharId)?.charName}
          </Typography>
          <Typography textAlign="center">
            {getCharById(chosenCharId)?.charSubName}
          </Typography>
          <Typography>Level: 80</Typography>
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
