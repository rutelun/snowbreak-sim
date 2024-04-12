import type { WeaponName } from "~/app/utils/pickers/constants";
import { ALLOWED_WEAPONS, getWeaponById } from "~/app/utils/pickers/constants";
import { useCallback, useEffect, useId, useRef, useState } from "react";
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
import type { WeaponType } from "~/lib/engine/types";
import type { WeaponInfo } from "~/app/components/Pickers/types";
import type { WeaponTier } from "~/lib/engine/Weapon";

type Props = {
  type: WeaponType;
  info: WeaponInfo | undefined;
  setInfo: (
    cb: (data: WeaponInfo | undefined) => WeaponInfo | undefined,
  ) => void;
};

export function WeaponPicker({ type, setInfo, info }: Props) {
  const previousTypeRef = useRef(type);
  const [isOpen, setIsOpen] = useState(false);
  const deleteWeapon = useCallback(() => {
    setInfo(() => undefined);
  }, [setInfo]);

  useEffect(() => {
    if (previousTypeRef.current !== type) {
      previousTypeRef.current = type;
      deleteWeapon();
    }
  }, [deleteWeapon, type]);

  const onItemClick = useCallback(
    (locCharId: string) => {
      setInfo((draft: WeaponInfo | undefined) => {
        if (!draft) {
          draft = {
            name: locCharId as WeaponName,
            tier: 1,
            lvl: 80,
          };
        }

        draft.name = locCharId as WeaponName;
        return draft;
      });
      setIsOpen(false);
    },
    [setInfo],
  );

  const setTier = useCallback(
    (tier: 1 | 2 | 3 | 4 | 5) => {
      setInfo((draft: WeaponInfo | undefined) => {
        if (!draft) {
          return draft;
        }

        draft.tier = tier;

        return draft;
      });
    },
    [setInfo],
  );

  const items = ALLOWED_WEAPONS.filter((weapon) => weapon.type === type);

  const tierId = useId();
  const levelId = useId();

  const rarity =
    (info?.name ? getWeaponById(info?.name)?.rarity : undefined) ?? 5;
  const allowedTiers =
    rarity === 4 ? ([1, 2, 3, 4, 5] as const) : ([1, 2] as const);

  const getImg = (charId: string) => `/weapons/${charId}.png`;
  return (
    <>
      {info?.name ? (
        <Box
          display="flex"
          justifyContent="space-between"
          flexDirection="column"
        >
          <Box sx={{ cursor: "pointer" }}>
            <img
              width="200px"
              height="70px"
              style={{ objectFit: "contain" }}
              key={info.name}
              src={getImg(info.name)}
              onClick={() => setIsOpen(true)}
            />
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
              <InputLabel id={tierId}>Tier</InputLabel>
              <Select
                label="Tier"
                size="small"
                labelId={tierId}
                value={info.tier}
                onChange={(e) => setTier(Number(e.target.value) as WeaponTier)}
              >
                {allowedTiers.map((tier) => (
                  <MenuItem value={tier} key={tier}>
                    {tier}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{ cursor: "pointer" }}
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
            {items.map((item) => (
              <Box
                sx={{ cursor: "pointer" }}
                flexDirection="column"
                justifyContent="center"
                textAlign="center"
                alignContent="center"
                key={item.weaponName}
                onClick={() => onItemClick(item.weaponName)}
                display="flex"
              >
                <Box width="434px" height="120px">
                  <img src={getImg(item.weaponName)} />
                </Box>
                <Typography>{item.weaponName}</Typography>
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
