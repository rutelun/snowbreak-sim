import { KaguyaWithSupportSkill } from "~/lib/characters/Kaguya/KaguyaWithSupportSkill";
import type { SkillType } from "~/lib/engine/AttributeManager";

export class Kaguya extends KaguyaWithSupportSkill {
  protected standardSkill(): void {
    throw new Error("not implemented");
  }

  protected ultimateSkill(): void {
    throw new Error("not implemented");
  }

  public allowedToUseSkills(): SkillType[] {
    return ["supportSkill"];
  }
}
