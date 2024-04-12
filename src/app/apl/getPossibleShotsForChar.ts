import type { ShotType } from "~/lib/engine/AttributeManager";
import type { FullCharInfo } from "~/app/components/Pickers/types";
import { getCharById } from "~/app/utils/pickers/constants";

export function getPossibleShotsForChar(char: FullCharInfo): ShotType[] {
  if (getCharById(char.char?.id)?.weaponType === "shotgun") {
    return ["ads", "hip-fire"];
  }

  return [];
}
