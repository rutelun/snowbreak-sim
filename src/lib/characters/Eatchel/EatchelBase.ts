import type { CharacterOpts } from "../../engine/Character";
import { Character } from "../../engine/Character";
import type { Engine } from "../../engine/Engine";
import type { Attribute, SkillType } from "../../engine/AttributeManager";
import type { WeaponType } from "../../engine/types";

export abstract class EatchelBase extends Character {
  public override name = "Eatchel";

  public readonly weaponType: WeaponType = "shotgun";

  protected override loadoutAttrs: { [attr in Attribute]?: number };

  protected energyCost: Record<SkillType, number> = {
    standardSkill: 5,
    supportSkill: 12,
    ultimateSkill: 40,
  };

  public constructor(engine: Engine, opts: CharacterOpts) {
    super(engine, opts);
    this.loadoutAttrs = {
      hpBase: 22382,
      atkBase: 1328,
      defBase: 1053,
      aligmentIndex: 300,
    };
  }
}
