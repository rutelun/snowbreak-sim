import type { Character } from "~/lib/engine/Character";
import { Kaguya } from "~/lib/characters/Kaguya/Kaguya";

export function getEnemyModifiersForChar(char: Character): string[] {
  const result: string[] = [];
  if (char instanceof Kaguya) {
    result.push(Kaguya.supportSkillModifierName);
  }

  return result;
}
