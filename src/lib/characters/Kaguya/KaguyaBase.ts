import type { CharacterOpts } from "../../engine/Character";
import { Character } from "../../engine/Character";
import type { Engine } from "../../engine/Engine";
import type { Attribute, SkillType } from "../../engine/AttributeManager";

export abstract class KaguyaBase extends Character {
  protected override loadoutAttrs: { [attr in Attribute]?: number };

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
