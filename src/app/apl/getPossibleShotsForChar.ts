import type { Character } from "~/lib/engine/Character";
import type { ShotType } from "~/lib/engine/AttributeManager";
import { ShotgunWeapon } from "~/lib/engine/ShotgunWeapon";

export function getPossibleShotsForChar(char: Character): ShotType[] {
  if (char.weapon instanceof ShotgunWeapon) {
    return ["ads", "hip-fire"];
  }

  return [];
}
