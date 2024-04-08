import type { Character } from "~/lib/engine/Character";
import { Amarna } from "~/lib/logistics/Amarna";
import { StrawberryShortcake } from "~/lib/weapons/assaultRifles/StrawberryShortcake";
import { PrismaticIgniter } from "~/lib/weapons/pistols/PrismaticIgniter";
import { BlitzingFangs } from "~/lib/weapons/shotguns/BlitzingFangs";

export function getActiveCharModifiersForChar(char: Character): string[] {
  const result: string[] = [];

  if (char.logistics) {
    if (char.logistics instanceof Amarna) {
      result.push(Amarna.ballisticModifierName);
    }
  }

  if (char.weapon instanceof StrawberryShortcake) {
    result.push(StrawberryShortcake.atkModifierName);
  }

  if (char.weapon instanceof PrismaticIgniter) {
    result.push(PrismaticIgniter.atkModifierName);
  }

  if (char.weapon instanceof BlitzingFangs) {
    result.push(BlitzingFangs.atkModifierName);
  }

  return result;
}
