import type { Engine } from "../Engine";
import type { CharacterOpts } from ".";
import { Creature } from "../Creature";
import type { Attribute, ElementType, SkillType } from "../AttributeManager";
import type { Weapon } from "../Weapon";
import type { WeaponType } from "../types";
import type { SkillLvl } from "~/lib/utils/getSkillValueByLevel";

export type Manifestation = 0 | 1 | 2 | 3 | 4 | 5;
export abstract class CharacterBase extends Creature {
  public static readonly charName: string;
  public static readonly charSubName: string;

  public static readonly weaponType: WeaponType;

  public static readonly element: ElementType;

  public static readonly mainAttribute: Attribute;

  protected abstract class: typeof CharacterBase;

  public static get id() {
    return `${this.charName} ${this.charSubName}`;
  }

  public get name(): string {
    return this.class.charName;
  }
  public get weaponType(): WeaponType {
    return this.class.weaponType;
  }
  public get element(): ElementType {
    return this.class.element;
  }

  public get mainAttribute(): Attribute {
    return this.class.mainAttribute;
  }

  public manifestation: Manifestation;

  protected abstract readonly loadoutAttrs: { [attr in Attribute]?: number };
  protected attrsPerManifestation: { [attr in Attribute]?: number } = {
    "hp%": 2,
    "atk%": 2,
  };

  public abstract weapon: Weapon;

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

  public onBattleStart(): void {}

  public destroy(): void {}
  public override getOwnAttr(attr: Attribute): number {
    return (
      super.getOwnAttr(attr) +
      this.manifestation * (this.attrsPerManifestation[attr] ?? 0)
    );
  }
}
