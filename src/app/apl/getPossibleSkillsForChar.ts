import { Eatchel } from "~/lib/characters/Eatchel";
import type { SkillType } from "~/lib/engine/AttributeManager";
import { Kaguya } from "~/lib/characters/Kaguya/Kaguya";
import { LittleSunshine } from "~/lib/characters/LittleSunshine/LittleSunshine";
import type { FullCharInfo } from "~/app/components/Pickers/types";

export function getPossibleSkillsForChar(char: FullCharInfo): SkillType[] {
  if (char.char?.id === Eatchel.id) {
    return ["supportSkill", "standardSkill", "ultimateSkill"];
  }

  if (char.char?.id === Kaguya.id) {
    return ["supportSkill"];
  }

  if (char.char?.id === LittleSunshine.id) {
    return ["supportSkill"];
  }

  return [];
}
