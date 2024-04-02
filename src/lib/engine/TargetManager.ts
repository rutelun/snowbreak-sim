import type { SimpleTargetType } from "./types";
import type { Creature } from "./Creature";
import type { Engine } from "./Engine";

export type TargetOptions =
  | { targetType: SimpleTargetType }
  | { targetType: "creature"; targetValue: Creature };
export class TargetManager {
  public constructor(private engine: Engine) {}

  public getTargets(opts: TargetOptions): Creature[] {
    switch (opts.targetType) {
      case "creature":
        return [opts.targetValue];
      case "everyone":
        return [this.engine.getEnemy(), ...this.engine.teamManager.getTeam()];
      case "enemy":
        return [this.engine.getEnemy()];
      case "activeChar":
        return [this.engine.teamManager.getActiveChar()];
      case "team":
        return this.engine.teamManager.getTeam();
      default:
        throw new Error("unknown target type");
    }
  }
}
