import { EatchelWithUltimateSkill } from "./EatchelWithUltimateSkill";
import type { InitializedModifier } from "~/lib/engine/ModifierManager";
import type { ElementType } from "~/lib/engine/AttributeManager";
import type { CharacterBase } from "~/lib/engine/Character/CharacterBase";
import type { WeaponType } from "~/lib/engine/types";

export class Eatchel extends EatchelWithUltimateSkill {
  protected class: typeof CharacterBase = Eatchel;
  public static override readonly charName = "Eatchel";
  public static override readonly charSubName = "The Cub";
  public static override readonly weaponType: WeaponType = "shotgun";
  public static override readonly element: ElementType = "kinetic";

  private deiwosBase = 20;
  private deiwosPer100Aligment = 6;

  private deiwosModifier: InitializedModifier | undefined = undefined;

  public override onBattleStart() {
    super.onBattleStart();

    this.deiwosModifier = this.engine.modifierManager.initializeModifier(this, {
      name: "Eatchel deiwos",
      durationType: "permanent",
      target: "creator",
      attr: "healBonus%",
      unique: true,
      getValue: () => {
        return (
          this.deiwosBase +
          (this.engine.attributeManager.getAttr(this, "aligmentIndex") / 100) *
            this.deiwosPer100Aligment
        );
      },
    });

    this.engine.modifierManager.applyModifier(this.deiwosModifier);
  }

  public override destroy() {
    if (this.deiwosModifier) {
      this.engine.modifierManager.removeModifier(this.deiwosModifier.id);
      this.deiwosModifier = undefined;
    }

    super.destroy();
  }
}
