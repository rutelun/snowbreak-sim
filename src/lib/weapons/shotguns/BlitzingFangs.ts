import type { Character } from "../../engine/Character";
import { ShotgunWeapon } from "../../engine/ShotgunWeapon";
import type { Modifier } from "../../engine/ModifierManager";
import type { Engine } from "../../engine/Engine";
import type { ActionId } from "../../engine/TimeManager";
import type { ElementType } from "../../engine/AttributeManager";
import { getValueByWeaponTier } from "~/lib/utils/getValueByWeaponTier";

type Opts = {
  tier: 1 | 2;
  lvl: 80;
};
export class BlitzingFangs extends ShotgunWeapon {
  element: ElementType = "kinetic";

  private storedHealth = 0;

  private storedHealthForDecay = 0;

  private plannedAction: ActionId | undefined = undefined;

  private values = {
    healingAndUltimateEffect: [18, 30],
    flatAtkFromStoredHealth: [10.8, 18],
    maxStoredHealth: 10_000,
    decayDuration: 20,
    healthFromDecay: 100,
  } as const;

  public static atkModifierName = "Blessing of Wind Atk";

  protected override modifiers: Modifier[] = [
    {
      name: BlitzingFangs.atkModifierName,
      durationType: "permanent",
      unique: true,
      target: "team",
      attr: "atkFlat",
      getValue: () =>
        (getValueByWeaponTier(this.values.flatAtkFromStoredHealth, this.tier) /
          100) *
        this.storedHealth,
    },
    {
      name: "Blessing of Wind Heal Effect",
      durationType: "permanent",
      unique: true,
      target: "creator",
      attr: "healBonus%",
      getValue: () =>
        getValueByWeaponTier(this.values.healingAndUltimateEffect, this.tier),
    },
    {
      name: "Blessing of Wind Ult Dmg",
      durationType: "permanent",
      unique: true,
      target: "creator",
      attr: "ultimateSkillDmg%",
      getValue: () =>
        getValueByWeaponTier(this.values.healingAndUltimateEffect, this.tier),
    },
  ];

  public constructor(engine: Engine, opts: Opts) {
    super(engine);
    this.tier = opts.tier;
    this.lvl = opts.lvl;
    this.rateOfFire = 60;
    this.ammoCapacity = 7;
    this.compability = 41;
    this.reloadSpd = 2.62;
    this.loadoutAttrs = {
      atkBase: 789,
      "atk%": 50,
    };
  }

  public override equip(owner: Character) {
    super.equip(owner);
  }

  public override onBattleStart() {
    super.onBattleStart();
    const subscription = this.engine.subscriptionManager.subscribe(
      "onHeal",
      ({ target, value }) => {
        if (!this.engine.teamManager.isInTeam(target)) {
          return;
        }

        this.storedHealth = Math.max(
          this.storedHealth + value,
          this.values.maxStoredHealth,
        );
        this.storedHealthForDecay = this.storedHealth;
      },
    );
    this.subscriptions.push(subscription);

    this.plannedAction = this.engine.timeManager.addPlannedAction({
      action: () => {
        this.storedHealth = Math.max(
          this.storedHealth -
            this.storedHealthForDecay / this.values.decayDuration,
          0,
        );
      },
      description: "Blitzing Fangs passive decay",
      type: "interval",
      options: {
        tickInterval: 1_000,
      },
    });
  }

  public override unequip() {
    if (this.plannedAction) {
      this.engine.timeManager.deletePlannedAction(this.plannedAction);
    }

    super.unequip();
  }
}
