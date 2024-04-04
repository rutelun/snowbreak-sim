import type { Engine } from "../Engine";
import type { CharacterOpts } from ".";
import { Creature } from "../Creature";
import type { Attribute, ElementType, SkillType } from "../AttributeManager";
import type { Weapon } from "../Weapon";
import type { WeaponType } from "../types";
import type { SkillLvl } from "~/lib/utils/getSkillValueByLevel";

export type Manifestation = 0 | 1 | 2 | 3 | 4 | 5;
export abstract class CharacterBase extends Creature {
  public abstract readonly name: string;

  public abstract element: ElementType;

  public manifestation: Manifestation;

  protected abstract readonly loadoutAttrs: { [attr in Attribute]?: number };

  public abstract weapon: Weapon;

  public abstract readonly weaponType: WeaponType;

  public skillLevel: Record<SkillType, SkillLvl> = {
    standardSkill: 4,
    ultimateSkill: 4,
    supportSkill: 4,
  };

  public constructor(engine: Engine, opts: CharacterOpts) {
    super(engine);
    this.lvl = opts.lvl;
    this.manifestation = opts.manifestation;
  }

  public abstract equipWeapon(weapon: Weapon): void;
  public abstract equipWeapon(weapon: Weapon): void;

  public onBattleStart(): void {}

  public destroy(): void {}
}
