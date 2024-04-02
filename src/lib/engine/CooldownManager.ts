import type { Engine } from "./Engine";

export type CooldownId = Symbol;

type CooldownChanger = (remainingCooldown: number) => number;
export class CooldownManager {
  private cooldownMap: Map<CooldownId, number> = new Map();

  public constructor(private engine: Engine) {}

  private getCurrentBattleTime() {
    return this.engine.timeManager.getBattleTime();
  }

  public createCooldownId(): CooldownId {
    const cooldownId = Symbol("cooldownId");
    this.cooldownMap.set(cooldownId, this.getCurrentBattleTime());

    return cooldownId;
  }

  public deleteCooldown(cooldownId: CooldownId) {
    this.cooldownMap.delete(cooldownId);
  }

  public isCooldownEnd(cooldownId: CooldownId) {
    if (!this.cooldownMap.has(cooldownId)) {
      throw new Error("unknown cooldown id");
    }
    const value = this.cooldownMap.get(cooldownId) ?? 0;
    return value <= this.getCurrentBattleTime();
  }

  public startCooldown(cooldownId: CooldownId, duration: number) {
    this.cooldownMap.set(cooldownId, this.getCurrentBattleTime() + duration);
  }

  public changeCooldown(cooldownId: CooldownId, changer: CooldownChanger) {
    if (!this.cooldownMap.has(cooldownId)) {
      throw new Error("unknown cooldown id");
    }

    const remainingCooldown = Math.max(
      (this.cooldownMap.get(cooldownId) ?? 0) - this.getCurrentBattleTime(),
      0,
    );

    this.cooldownMap.set(
      cooldownId,
      this.getCurrentBattleTime() + changer(remainingCooldown),
    );
  }

  public waitCooldown(cooldownId: CooldownId) {
    if (!this.cooldownMap.has(cooldownId)) {
      throw new Error("unknown cooldown id");
    }

    const remainingCooldown = Math.max(
      (this.cooldownMap.get(cooldownId) ?? 0) - this.getCurrentBattleTime(),
      0,
    );
    if (remainingCooldown === 0) {
      return;
    }

    this.engine.timeManager.doAction({
      duration: remainingCooldown,
      isDurationConfirmed: true,
      description: "waiting cooldown",
      action: () => {},
      caster: undefined,
    });
  }
}
