import { KaguyaWithSupportSkill } from "~/lib/characters/Kaguya/KaguyaWithSupportSkill";

export class Kaguya extends KaguyaWithSupportSkill {
  protected standardSkill(): void {
    throw new Error("not implemented");
  }

  protected ultimateSkill(): void {
    throw new Error("not implemented");
  }
}
