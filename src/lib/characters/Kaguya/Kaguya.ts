import { KaguyaWithSupportSkill } from "~/lib/characters/Kaguya/KaguyaWithSupportSkill";
import type { ElementType } from "~/lib/engine/AttributeManager";
import type { CharacterBase } from "~/lib/engine/Character/CharacterBase";
import type { WeaponType } from "~/lib/engine/types";

export class Kaguya extends KaguyaWithSupportSkill {
  public override class: typeof CharacterBase = Kaguya;
  public static override readonly charName = "Acacia";
  public static override readonly charSubName = "Kaguya";

  public static override readonly weaponType: WeaponType = "pistol";
  public static override readonly element: ElementType = "frost";
  protected standardSkill(): void {
    throw new Error("not implemented");
  }

  protected ultimateSkill(): void {
    throw new Error("not implemented");
  }
}
