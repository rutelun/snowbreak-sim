import type { ShotType } from "~/lib/engine/AttributeManager";
import type { Creature } from "~/lib/engine/Creature";
import { Eatchel } from "~/lib/characters/Eatchel";

export function getPossibleAplShots(creature: Creature): ShotType[] {
  if (creature instanceof Eatchel) {
    return ["ads", "hip-fire"];
  }

  return [];
}
