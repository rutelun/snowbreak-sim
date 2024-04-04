import type { CharacterOpts } from "../../engine/Character";
import { Character } from "../../engine/Character";
import type { Engine } from "../../engine/Engine";
import type {
  Attribute,
  ElementType,
  SkillType,
} from "../../engine/AttributeManager";
import type { WeaponType } from "../../engine/types";

export abstract class KaguyaBase extends Character {
  public override name = "Kaguya";

  public readonly weaponType: WeaponType = "shotgun";

  protected override loadoutAttrs: { [attr in Attribute]?: number };

  public override element: ElementType = "frost";

  protected energyCost: Record<SkillType, number> = {
    standardSkill: 15,
    supportSkill: 35,
    ultimateSkill: 80,
  };

  public constructor(engine: Engine, opts: CharacterOpts) {
    super(engine, opts);
    this.loadoutAttrs = {
      hpBase: 22500,
      atkBase: 1259,
      defBase: 864,
      aligmentIndex: 300,
    };
  }
}
