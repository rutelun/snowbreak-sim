import { BlitzingFangs } from "~/lib/weapons/shotguns/BlitzingFangs";
import { Eatchel } from "~/lib/characters/Eatchel";
import { Kaguya } from "~/lib/characters/Kaguya/Kaguya";
import { LittleSunshine } from "~/lib/characters/LittleSunshine/LittleSunshine";

export const ALLOWED_CHARS = [Eatchel, Kaguya, LittleSunshine];
const ALLOWED_CHARS_MAP = new Map(ALLOWED_CHARS.map((char) => [char.id, char]));

export type CharName = (typeof ALLOWED_CHARS)[number]["charName"];

export function getCharById(
  id: string,
): (typeof ALLOWED_CHARS)[number] | undefined {
  return ALLOWED_CHARS_MAP.get(id);
}

export const ALLOWED_WEAPONS = [BlitzingFangs];
export type WeaponName = (typeof ALLOWED_WEAPONS)[number]["weaponName"];
