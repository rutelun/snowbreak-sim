import { Kaguya } from "~/lib/characters/Kaguya/Kaguya";
import type { FullCharInfo } from "~/app/components/Pickers/types";

export function getEnemyModifiersForChar(char: FullCharInfo): string[] {
  const result: string[] = [];
  if (char.char?.id === Kaguya.id) {
    result.push(Kaguya.supportSkillModifierName);
  }

  return result;
}
