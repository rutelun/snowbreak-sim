import { Eatchel } from "../characters/Eatchel";
import { BlitzingFangs } from "../weapons/shotguns/BlitzingFangs";
import { Engine } from "../engine/Engine";
import { LuxSquad } from "../logistics/LuxSquad";

export function eatchelExample() {
  const engine = new Engine({
    damage: {
      alwaysHitWeakPoint: true,
    },
    enemy: {
      hitActiveCharEverySecond: true,
    },
  });

  const eatchel = new Eatchel(engine, { lvl: 80, manifestation: 0 });
  eatchel.equipWeapon(new BlitzingFangs(engine, { lvl: 80, tier: 2 }));
  eatchel.equipLogistics(
    new LuxSquad(engine, [
      { skillHaste: 19.3, aligmentIndex: 106, "healBonus%": 10.6 },
      { skillHaste: 19.3, aligmentIndex: 106, "healBonus%": 10.6 },
      { skillHaste: 19.3, aligmentIndex: 106, "healBonus%": 10.6 },
    ]),
  );

  engine.timeManager.startBattle();

  while (engine.timeManager.getBattleTime() < 40_000) {
    // const needUseKaguyaSkill = !engine.modifierManager.hasModifierByName(enemy, kaguya.supportSkillModifierName) ||
    //     !engine.modifierManager.hasModifierByName(eatchel, AmarnaSet.ballisticModifierName);
    //
    // if (needUseKaguyaSkill && kaguya.canUseSkill('supportSkill')) {
    //     kaguya.useSkill('supportSkill');
    // }

    if (eatchel.canUseSkill("ultimateSkill")) {
      eatchel.useSkill("ultimateSkill");
    }

    while (!eatchel.canUseSkill("standardSkill")) {
      if (eatchel.canShot()) {
        eatchel.useShot("hip-fire");
      } else {
        eatchel.usePartialReload();
      }
    }

    eatchel.useSkill("standardSkill");
  }

  console.log(engine.historyManager.getPrettified());
}
