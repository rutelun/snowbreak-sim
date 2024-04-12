import { BlitzingFangs } from "~/lib/weapons/shotguns/BlitzingFangs";
import { Eatchel } from "~/lib/characters/Eatchel";
import { Kaguya } from "~/lib/characters/Kaguya/Kaguya";
import { LittleSunshine } from "~/lib/characters/LittleSunshine/LittleSunshine";
import { TinyGrains } from "~/lib/weapons/shotguns/TinyGrains";
import { StrawberryShortcake } from "~/lib/weapons/assaultRifles/StrawberryShortcake";
import { PrismaticIgniter } from "~/lib/weapons/pistols/PrismaticIgniter";
import { AmanoIwato } from "~/lib/logistics/AmanoIwato";
import { Amarna } from "~/lib/logistics/Amarna";
import { LuxSquad } from "~/lib/logistics/LuxSquad";

export const ALLOWED_CHARS = [Eatchel, Kaguya, LittleSunshine];
const ALLOWED_CHARS_MAP = new Map(ALLOWED_CHARS.map((char) => [char.id, char]));

export type CharId = (typeof ALLOWED_CHARS)[number]["charName"];

export function getCharById(
  id: string | undefined,
): (typeof ALLOWED_CHARS)[number] | undefined {
  if (!id) {
    return;
  }
  return ALLOWED_CHARS_MAP.get(id);
}

export const ALLOWED_WEAPONS = [
  BlitzingFangs,
  TinyGrains,
  StrawberryShortcake,
  PrismaticIgniter,
];
const ALLOWED_WEAPONS_MAP = new Map(
  ALLOWED_WEAPONS.map((item) => [item.weaponName, item]),
);
export type WeaponName = (typeof ALLOWED_WEAPONS)[number]["weaponName"];

export function getWeaponById(
  id: string,
): (typeof ALLOWED_WEAPONS)[number] | undefined {
  return ALLOWED_WEAPONS_MAP.get(id);
}
export const ALLOWED_LOGISTICS = [AmanoIwato, Amarna, LuxSquad];

export const ALLOWED_LOGISTICS_MAP = new Map(
  ALLOWED_LOGISTICS.map((item) => [item.logisticName, item]),
);

export function getLogisticsById(
  id: string,
): (typeof ALLOWED_LOGISTICS)[number] | undefined {
  return ALLOWED_LOGISTICS_MAP.get(id);
}

export const ALLOWED_LOGISTICS_NAMES = ALLOWED_LOGISTICS.map(
  (logistic) => logistic.logisticName,
);

export type LogisticSetName =
  (typeof ALLOWED_LOGISTICS)[number]["logisticName"];

export const STATS_FOR_LOGISTICS = {
  "hp%": [4.0, 5.5, 7.0, 8.5, 10.0],
  "atk%": [4.0, 5.5, 7.0, 8.5, 10.0],
  "def%": [4.0, 5.5, 7.0, 8.5, 10.0],
  "critDmg%": [4.2, 5.8, 7.4, 9.0, 10.6],
  critRate: [2.1, 2.9, 3.7, 4.5, 5.3],
  skillHaste: [7.7, 10.6, 13.5, 16.4, 19.3],
  aligmentIndex: [42.4, 58.3, 74.2, 90.1, 106],
  "sEnergyRecovery%": [5.6, 7.8, 9.9, 12, 14.1],
  "uEnergyRecovery%": [5.6, 7.8, 9.9, 12, 14.1],
} as const;

export const THIRD_STATS_FOR_LOGISTICS = {
  "kineticDmg%": [3.4, 4.7, 5.9, 7.2, 8.5],
  "thermalDmg%": [3.4, 4.7, 5.9, 7.2, 8.5],
  "frostDmg%": [3.4, 4.7, 5.9, 7.2, 8.5],
  "electricalDmg%": [3.4, 4.7, 5.9, 7.2, 8.5],
  "chaosDmg%": [3.4, 4.7, 5.9, 7.2, 8.5],
  "healBonus%": [4.2, 5.8, 7.4, 9.0, 10.6],
} as const;
