import type { Engine } from "./Engine";
import type { Attribute } from "./AttributeManager";

export abstract class Creature {
  public lvl: number = 80;

  public abstract readonly name: string;

  protected abstract loadoutAttrs: { [attr in Attribute]?: number };

  public constructor(protected engine: Engine) {}

  public getOwnAttr(attr: Attribute): number {
    return this.loadoutAttrs[attr] ?? 0;
  }

  public abstract onBattleStart(): void;
  public hasShield() {
    return false;
  }
}
