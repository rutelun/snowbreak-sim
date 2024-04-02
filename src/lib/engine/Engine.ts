import { CooldownManager } from "./CooldownManager";
import type { DamageAndHealManagerOpts } from "./DamageAndHealManager";
import { DamageAndHealManager } from "./DamageAndHealManager";
import { TargetManager } from "./TargetManager";
import { TeamManager } from "./TeamManager";
import { TimeManager } from "./TimeManager";
import { Enemy } from "./Enemy";
import { SubscriptionManager } from "./SubscriptionManager";
import { AbilityManager } from "./AbilityManager";
import { AttributeManager } from "./AttributeManager";
import { ModifierManager } from "./ModifierManager";
import { HistoryManager } from "./HistoryManager";
import { EnergyManager } from "./EnergyManager";

type Opts = {
  damage?: DamageAndHealManagerOpts;
  enemy?: {
    hitActiveCharEverySecond: boolean;
  };
};

export class Engine {
  public cooldownManager: CooldownManager;

  public damageAndHealManager: DamageAndHealManager;

  public targetManager: TargetManager;

  public teamManager: TeamManager;

  public timeManager: TimeManager;

  public subscriptionManager: SubscriptionManager;

  public abilityManager: AbilityManager;

  public attributeManager: AttributeManager;

  public modifierManager: ModifierManager;

  public historyManager: HistoryManager;

  public uEnergyManager: EnergyManager;

  private readonly enemy: Enemy;

  constructor(opts: Opts = {}) {
    this.cooldownManager = new CooldownManager(this);
    this.damageAndHealManager = new DamageAndHealManager(
      this,
      opts.damage ?? {},
    );
    this.targetManager = new TargetManager(this);
    this.teamManager = new TeamManager(this);
    this.timeManager = new TimeManager(this);
    this.subscriptionManager = new SubscriptionManager();
    this.abilityManager = new AbilityManager(this);
    this.attributeManager = new AttributeManager(this);
    this.modifierManager = new ModifierManager(this);
    this.historyManager = new HistoryManager(this);
    this.uEnergyManager = new EnergyManager("UEnergy");
    this.enemy = new Enemy(this);
  }

  public getEnemy(): Enemy {
    return this.enemy;
  }
}
