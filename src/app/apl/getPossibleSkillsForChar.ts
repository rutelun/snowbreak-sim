import type { Character } from "~/lib/engine/Character";
import { Eatchel } from "~/lib/characters/Eatchel";
import type { SkillType } from "~/lib/engine/AttributeManager";
import { Kaguya } from "~/lib/characters/Kaguya/Kaguya";
import { LittleSunshine } from "~/lib/characters/LittleSunshine/LittleSunshine";

export function getPossibleSkillsForChar(char: Character): SkillType[] {
  if (char instanceof Eatchel) {
    return ["supportSkill", "standardSkill", "ultimateSkill"];
  }

  if (char instanceof Kaguya) {
    return ["supportSkill"];
  }

  if (char instanceof LittleSunshine) {
    return ["supportSkill"];
  }

  return [];
}
