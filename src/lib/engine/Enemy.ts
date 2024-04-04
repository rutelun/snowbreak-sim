import { Creature } from "./Creature";
import type { Attribute } from "./AttributeManager";
import type { ActionId } from "~/lib/engine/TimeManager";

export type EnemySettings = {
  dealDamageEveryNSeconds: number;
};
export class Enemy extends Creature {
  protected loadoutAttrs: { [attr in Attribute]?: number } = {};

  private actions: Set<ActionId> = new Set();

  private settings: EnemySettings = { dealDamageEveryNSeconds: 0 };

  public setSettings(settings: EnemySettings) {
    this.settings = settings;
  }

  private dealDamage() {
    this.engine.damageAndHealManager.dealDamage({
      damageType: "hip-fire",
      caster: this,
      targetOptions: { targetType: "activeChar" },
      element: "chaos",
      value: {
        type: "atkBased",
        percent: 0,
        flat: 10,
      },
    });
  }

  public onBattleStart() {
    if (this.settings.dealDamageEveryNSeconds) {
      this.actions.add(
        this.engine.timeManager.addPlannedAction({
          action: () => this.dealDamage(),
          type: "once",
          waitingDuration: 0,
          description: "Enemy deals damage",
        }),
      );

      this.actions.add(
        this.engine.timeManager.addPlannedAction({
          action: () => this.dealDamage(),
          type: "interval",
          options: {
            tickInterval: this.settings.dealDamageEveryNSeconds * 1000,
          },
          description: "Enemy deals damage",
        }),
      );
    }
  }

  public readonly name: string = "dummyEnemy";
}
