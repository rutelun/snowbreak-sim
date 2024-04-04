import type { CharacterOpts } from "../../engine/Character";
import { Character } from "../../engine/Character";
import type { Engine } from "../../engine/Engine";
import type {
  Attribute,
  ElementType,
  SkillType,
} from "../../engine/AttributeManager";
import type { WeaponType } from "../../engine/types";

export abstract class LittleSunshineBase extends Character {
  public override name = "Little Sunshine";

  public readonly weaponType: WeaponType = "assaultRifle";

  protected override loadoutAttrs: { [attr in Attribute]?: number };

  public override element: ElementType = "thermal";

  protected energyCost: Record<SkillType, number> = {
    standardSkill: 15,
    supportSkill: 30,
    ultimateSkill: 80,
  };

  public constructor(engine: Engine, opts: CharacterOpts) {
    super(engine, opts);
    this.loadoutAttrs = {
      hpBase: 20712,
      atkBase: 1219,
      defBase: 749,
      aligmentIndex: 300,
    };
  }
}
