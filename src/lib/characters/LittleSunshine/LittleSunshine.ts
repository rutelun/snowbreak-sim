import { LittleSunshineWithSupportSkill } from "~/lib/characters/LittleSunshine/LittleSunshineWithSupportSkill";
import type { InitializedModifier } from "~/lib/engine/ModifierManager";
import type { ElementType } from "~/lib/engine/AttributeManager";
import type { CharacterBase } from "~/lib/engine/Character/CharacterBase";
import type { WeaponType } from "~/lib/engine/types";

export class LittleSunshine extends LittleSunshineWithSupportSkill {
  private deiwosBase = 8;
  private deiwosPer100Aligment = 1;
  public static override readonly charName = "Fritia";
  public static override readonly charSubName = "Little Sunshine";
  public static override readonly weaponType: WeaponType = "assaultRifle";
  public static override readonly element: ElementType = "thermal";
  public override class: typeof CharacterBase = LittleSunshine;

  private deiwosModifier: InitializedModifier | undefined = undefined;

  public override onBattleStart() {
    super.onBattleStart();

    this.deiwosModifier = this.engine.modifierManager.initializeModifier(this, {
      name: "Little Sunshine deiwos",
      durationType: "permanent",
      target: "team",
      attr: "dmg%",
      unique: true,
      getValue: () => {
        const value =
          this.deiwosBase +
          (this.engine.attributeManager.getAttr(this, "aligmentIndex") / 100) *
            this.deiwosPer100Aligment;

        if (
          this.engine.effectManager.hasEffect(this.engine.getEnemy(), "burning")
        ) {
          return value;
        }

        return 0;
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
  protected standardSkill(): void {
    throw new Error("not implemented");
  }

  protected ultimateSkill(): void {
    throw new Error("not implemented");
  }
}
