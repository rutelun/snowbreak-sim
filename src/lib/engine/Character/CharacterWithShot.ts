import { CharacterWithSkill } from "./CharacterWithSkill";
import type { ShotType } from "../AttributeManager";

export abstract class CharacterWithShot extends CharacterWithSkill {
  public useShot(shotType: ShotType) {
    this.engine.abilityManager.useShot(this, shotType, () =>
      this.shot(shotType),
    );
  }

  public useReload() {
    this.engine.abilityManager.useReload(() => this.reload());
  }

  public usePartialReloadIfCantShot() {
    if (!this.canShot()) {
      this.usePartialReload();
    }
  }

  public usePartialReload() {
    this.engine.abilityManager.usePartialReload(() => this.partialReload());
  }

  public useShotIfPossible(type: ShotType) {
    if (this.canShot()) {
      return this.shot(type);
    }
  }

  public canShot() {
    return this.weapon.canShot();
  }

  protected shot(type: ShotType) {
    this.weapon.shot(type);
  }

  protected reload() {
    this.weapon.reload();
  }

  protected partialReload() {
    this.weapon.partialReload();
  }
}
