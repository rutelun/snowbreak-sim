import type { Character } from "../../engine/Character";
import { ShotgunWeapon } from "../../engine/ShotgunWeapon";
import type {
  InitializedModifier,
  Modifier,
} from "../../engine/ModifierManager";
import type { Engine } from "../../engine/Engine";
import type { ActionId } from "../../engine/TimeManager";
import type { ElementType } from "../../engine/AttributeManager";
import { getValueByWeaponTier } from "~/lib/utils/getValueByWeaponTier";

type Opts = {
  tier: 1 | 2;
  lvl: 80;
};
export class TinyGrains extends ShotgunWeapon {
  element: ElementType = "kinetic";

  private plannedAction: ActionId | undefined = undefined;

  private atk = [18, 30];
  private damageTaken = [9.6, 16];

  protected override modifiers: Modifier[] = [
    {
      name: "Tiny Grains atk",
      durationType: "permanent",
      unique: true,
      target: "creator",
      attr: "atk%",
      getValue: () => getValueByWeaponTier(this.atk, this.tier),
    },
  ];

  private dmgTakenModifier: Modifier = {
    name: "Tiny Grains atk",
    durationType: "time",
    duration: 3_000,
    unique: true,
    target: "enemy",
    attr: "damageTaken%",
    getValue: () => getValueByWeaponTier(this.damageTaken, this.tier),
  };

  private dmgTakenModifierInitialized: InitializedModifier | undefined =
    undefined;

  public constructor(engine: Engine, opts: Opts) {
    super(engine);
    this.tier = opts.tier;
    this.lvl = opts.lvl;
    this.rateOfFire = 60;
    this.ammoCapacity = 7;
    this.compability = 41;
    this.reloadSpd = 2.62;
    this.loadoutAttrs = {
      atkBase: 811,
      "atk%": 52,
      "critDmg%": 30,
      critRate: 25,
    };
  }

  public override equip(owner: Character) {
    super.equip(owner);

    this.dmgTakenModifierInitialized =
      this.engine.modifierManager.initializeModifier(
        owner,
        this.dmgTakenModifier,
      );
  }

  public override onBattleStart() {
    super.onBattleStart();
    const subscription = this.engine.subscriptionManager.subscribe(
      "onDamageDealt",
      ({ target }) => {
        if (target !== this.owner || !this.dmgTakenModifierInitialized) {
          return;
        }

        this.engine.modifierManager.applyModifier(
          this.dmgTakenModifierInitialized,
        );
      },
    );
    this.subscriptions.push(subscription);
  }

  public override unequip() {
    if (this.plannedAction) {
      this.engine.timeManager.deletePlannedAction(this.plannedAction);
    }

    super.unequip();
  }
}
