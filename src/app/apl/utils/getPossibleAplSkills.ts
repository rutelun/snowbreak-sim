import type { SkillType } from "~/lib/engine/AttributeManager";
import type { Creature } from "~/lib/engine/Creature";
import { Eatchel } from "~/lib/characters/Eatchel";
import { LittleSunshine } from "~/lib/characters/LittleSunshine/LittleSunshine";
import { Kaguya } from "~/lib/characters/Kaguya/Kaguya";

export function getPossibleAplSkills(creature: Creature): SkillType[] {
  if (creature instanceof Eatchel) {
    return ["supportSkill", "standardSkill", "ultimateSkill"];
  }

  if (creature instanceof LittleSunshine) {
    return ["supportSkill"];
  }

  if (creature instanceof Kaguya) {
    return ["supportSkill"];
  }

  return [];
}
