import { CharacterBase } from "./CharacterBase";
import { EnergyManager } from "../EnergyManager";
import type { SkillType } from "../AttributeManager";
import type { CooldownId } from "../CooldownManager";
import type { Engine } from "../Engine";
import type { CharacterOpts } from ".";
import type { ActionId } from "../TimeManager";

export abstract class CharacterWithSkill extends CharacterBase {
  private sEnergyManager = new EnergyManager("SEnergy");

  private readonly skillCooldownIds: Record<SkillType, CooldownId>;

  private sEnergyRegenActionId: ActionId | null = null;

  protected abstract energyCost: Record<SkillType, number>;

  public constructor(engine: Engine, opts: CharacterOpts) {
    super(engine, opts);

    this.skillCooldownIds = {
      standardSkill: this.engine.cooldownManager.createCooldownId(),
      supportSkill: this.engine.cooldownManager.createCooldownId(),
      ultimateSkill: this.engine.cooldownManager.createCooldownId(),
    };
  }

  public useSkill(skillType: SkillType) {
    if (!this.canUseSkill(skillType)) {
      throw new Error(`${skillType} still has cooldown`);
    }

    const usage = (): void => {
      switch (skillType) {
        case "standardSkill":
          return this.standardSkill();
        case "supportSkill":
          return this.supportSkill();
        case "ultimateSkill":
          return this.ultimateSkill();
        default:
          throw new Error("unknown skill type");
      }
    };

    this.engine.abilityManager.useSkill(this, skillType, usage);
  }

  protected startSkillCooldown(skillType: SkillType, duration: number) {
    this.engine.cooldownManager.startCooldown(
      this.skillCooldownIds[skillType],
      duration / (1 + this.engine.attributeManager.getAttr(this, "skillHaste")),
    );
  }

  protected isSkillCooldownEnd(skillType: SkillType) {
    return this.engine.cooldownManager.isCooldownEnd(
      this.skillCooldownIds[skillType],
    );
  }

  public canUseSkill(skillType: SkillType) {
    const energyCost = this.energyCost[skillType];
    if (
      skillType === "ultimateSkill" &&
      !this.engine.uEnergyManager.canSpent(energyCost)
    ) {
      return false;
    }
    if (
      ["standardSkill", "supportSkill"].includes(skillType) &&
      !this.sEnergyManager.canSpent(energyCost)
    ) {
      return false;
    }

    return this.isSkillCooldownEnd(skillType);
  }

  protected abstract standardSkill(): void;
  protected abstract supportSkill(): void;
  protected abstract ultimateSkill(): void;

  public override onBattleStart() {
    super.onBattleStart();

    this.sEnergyRegenActionId = this.engine.timeManager.addPlannedAction({
      type: "interval",
      options: { tickInterval: 1_000 },
      description: `${this.name} generate s-energy`,
      action: () => this.generateSEnergy(1),
    });
  }

  public override destroy() {
    if (this.sEnergyRegenActionId) {
      this.engine.timeManager.deletePlannedAction(this.sEnergyRegenActionId);
      this.sEnergyRegenActionId = null;
    }

    this.engine.cooldownManager.deleteCooldown(
      this.skillCooldownIds.supportSkill,
    );
    this.engine.cooldownManager.deleteCooldown(
      this.skillCooldownIds.ultimateSkill,
    );
    this.engine.cooldownManager.deleteCooldown(
      this.skillCooldownIds.standardSkill,
    );

    super.destroy();
  }

  public generateUEnergy(value: number) {
    this.engine.uEnergyManager.generate(
      value *
        (1 + this.engine.attributeManager.getAttr(this, "uEnergyRecovery%")),
    );
  }

  protected generateSEnergy(value: number) {
    this.sEnergyManager.generate(
      value *
        (1 + this.engine.attributeManager.getAttr(this, "sEnergyRecovery%")),
    );
  }

  protected spentSEnergy(value: number) {
    this.sEnergyManager.spent(value);
  }
}
