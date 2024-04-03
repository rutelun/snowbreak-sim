import { EatchelWithUltimateSkill } from "./EatchelWithUltimateSkill";
import type { InitializedModifier } from "~/lib/engine/ModifierManager";

export class Eatchel extends EatchelWithUltimateSkill {
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
  }

  public override destroy() {
    if (this.deiwosModifier) {
      this.engine.modifierManager.removeModifier(this.deiwosModifier.id);
      this.deiwosModifier = undefined;
    }

    super.destroy();
  }
}
