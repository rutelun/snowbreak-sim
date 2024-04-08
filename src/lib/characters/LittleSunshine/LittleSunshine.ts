import { LittleSunshineWithSupportSkill } from "~/lib/characters/LittleSunshine/LittleSunshineWithSupportSkill";
import type { InitializedModifier } from "~/lib/engine/ModifierManager";
import type { SkillType } from "~/lib/engine/AttributeManager";

export class LittleSunshine extends LittleSunshineWithSupportSkill {
  private deiwosBase = 8;
  private deiwosPer100Aligment = 1;

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

  public allowedToUseSkills(): SkillType[] {
    return ["supportSkill"];
  }
}
