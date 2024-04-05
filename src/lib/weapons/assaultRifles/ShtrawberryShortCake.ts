import type { Character } from "../../engine/Character";
import type {
  InitializedModifier,
  Modifier,
} from "../../engine/ModifierManager";
import type { Engine } from "../../engine/Engine";
import type { ElementType } from "../../engine/AttributeManager";
import { getValueByWeaponTier } from "~/lib/utils/getValueByWeaponTier";
import { AssaultRifleWeapon } from "~/lib/engine/AssaultRifleWeapon";

type Opts = {
  tier: 1 | 2 | 3 | 4 | 5;
  lvl: 80;
};
export class StrawberryShortcake extends AssaultRifleWeapon {
  element: ElementType = "thermal";

  private duration = 15_000;

  private atk = [13.2, 14.4, 16.6, 18.8, 20, 22];

  public static atkModifierName = "Strawberry Shortcake Atk";

  private modifier: Modifier = {
    name: StrawberryShortcake.atkModifierName,
    durationType: "time",
    duration: this.duration,
    unique: true,
    target: "activeChar",
    attr: "atkFlat",
    getValue: () => {
      if (!this.owner) {
        throw new Error("no owner");
      }
      return (
        (getValueByWeaponTier(this.atk, this.tier) / 100) *
        this.engine.attributeManager.getLoadoutAttr(this.owner, "totalAtk")
      );
    },
  };

  private intializedModifier: InitializedModifier | undefined = undefined;

  public constructor(engine: Engine, opts: Opts) {
    super(engine);
    this.tier = opts.tier;
    this.lvl = opts.lvl;
    this.rateOfFire = 75;
    this.ammoCapacity = 6;
    this.compability = 146.46;
    this.reloadSpd = 1;
    this.loadoutAttrs = {
      atkBase: 789,
      "atk%": 40,
      "weaponCritDmg%": 60,
      critRate: 0, // TODO:
    };
  }

  public override equip(owner: Character) {
    super.equip(owner);
    this.intializedModifier = this.engine.modifierManager.initializeModifier(
      owner,
      this.modifier,
    );
  }

  public override onBattleStart() {
    super.onBattleStart();
    const subscription = this.engine.subscriptionManager.subscribe(
      "onSkillUsed",
      ({ caster, skillType }) => {
        if (caster !== this.owner || skillType !== "supportSkill") {
          return;
        }

        if (!this.intializedModifier) {
          throw new Error("no initialized modifier");
        }

        this.engine.modifierManager.applyModifier(this.intializedModifier);
      },
    );
    this.subscriptions.push(subscription);
  }

  public override unequip() {
    if (this.intializedModifier) {
      this.engine.modifierManager.removeModifier(this.intializedModifier.id);
      this.intializedModifier = undefined;
    }

    super.unequip();
  }
}
