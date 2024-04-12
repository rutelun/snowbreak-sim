import { Amarna } from "~/lib/logistics/Amarna";
import { StrawberryShortcake } from "~/lib/weapons/assaultRifles/StrawberryShortcake";
import { PrismaticIgniter } from "~/lib/weapons/pistols/PrismaticIgniter";
import { BlitzingFangs } from "~/lib/weapons/shotguns/BlitzingFangs";
import type { FullCharInfo } from "~/app/components/Pickers/types";

export function getActiveCharModifiersForChar(char: FullCharInfo): string[] {
  const result: string[] = [];

  if (char.logistics) {
    if (char.logistics.name === Amarna.logisticName) {
      result.push(Amarna.ballisticModifierName);
    }
  }

  if (char.weapon?.name === StrawberryShortcake.weaponName) {
    result.push(StrawberryShortcake.atkModifierName);
  }

  if (char.weapon?.name === PrismaticIgniter.weaponName) {
    result.push(PrismaticIgniter.atkModifierName);
  }

  if (char.weapon?.name === BlitzingFangs.weaponName) {
    result.push(BlitzingFangs.atkModifierName);
  }

  return result;
}
