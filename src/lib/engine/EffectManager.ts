import type { Creature } from "~/lib/engine/Creature";
import type { ActionId } from "~/lib/engine/TimeManager";
import type { Engine } from "~/lib/engine/Engine";

type Effect = "burning";

type EffectInfo = {
  expireBattleTime: number;
  actionId: ActionId;
};

type ApplyEffectInfo = {
  effect: Effect;
  duration: number;
};

export class EffectManager {
  private effects: Map<Creature, Map<Effect, EffectInfo>> = new Map();

  public constructor(private engine: Engine) {}

  public applyEffect(creature: Creature, applyInfo: ApplyEffectInfo) {
    if (!this.effects.has(creature)) {
      this.effects.set(creature, new Map());
    }

    const oldEffect = this.effects.get(creature)?.get(applyInfo.effect);
    const newEffectBattleTime =
      this.engine.timeManager.getBattleTime() + applyInfo.duration;
    if (oldEffect && oldEffect.expireBattleTime > newEffectBattleTime) {
      return;
    }

    if (oldEffect) {
      this.engine.timeManager.deletePlannedAction(oldEffect.actionId);
    }

    const actionId = this.engine.timeManager.addPlannedAction({
      action: () => this.effects.get(creature)?.delete(applyInfo.effect),
      description: `Remove ${applyInfo.effect} effect`,
      waitingDuration: applyInfo.duration,
      type: "once",
    });

    this.effects.get(creature)?.set(applyInfo.effect, {
      actionId,
      expireBattleTime: newEffectBattleTime,
    });
  }

  public hasEffect(creature: Creature, effect: Effect) {
    return this.effects.get(creature)?.has(effect);
  }
}
