import { Eatchel } from "../characters/Eatchel";
import { BlitzingFangs } from "../weapons/shotguns/BlitzingFangs";
import { Engine } from "../engine/Engine";
import { AmanoIwato } from "~/lib/logistics/AmanoIwato";
import { Kaguya } from "~/lib/characters/Kaguya/Kaguya";
import { PrismaticIgniter } from "~/lib/weapons/pistols/PrismaticIgniter";
import { Amarna } from "~/lib/logistics/Amarna";

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
    new AmanoIwato(engine, [
      { "atk%": 10, skillHaste: 19.3, "kineticDmg%": 8.5 },
      { "atk%": 10, "critDmg%": 10.6, "kineticDmg%": 8.5 },
      { "atk%": 10, aligmentIndex: 103, "kineticDmg%": 8.5 },
    ]),
  );

  const kaguya = new Kaguya(engine, { lvl: 80, manifestation: 0 });
  kaguya.equipWeapon(new PrismaticIgniter(engine, { lvl: 80, tier: 1 }));
  kaguya.equipLogistics(
    new Amarna(engine, [
      { "atk%": 10, skillHaste: 19.3, "kineticDmg%": 8.5 },
      { "atk%": 10, skillHaste: 19.3, "kineticDmg%": 8.5 },
      { "atk%": 10, "sEnergyRecovery%": 14.1, "kineticDmg%": 8.5 },
    ]),
  );

  engine.timeManager.startBattle();

  const enemy = engine.getEnemy();

  while (engine.timeManager.getBattleTime() < 90_000) {
    const needUseKaguyaSkill =
      !engine.modifierManager.hasModifierByName(
        enemy,
        Kaguya.supportSkillModifierName,
      ) ||
      !engine.modifierManager.hasModifierByName(
        eatchel,
        Amarna.ballisticModifierName,
      );

    if (needUseKaguyaSkill && kaguya.canUseSkill("supportSkill")) {
      kaguya.useSkill("supportSkill");
    }

    if (eatchel.canUseSkill("ultimateSkill")) {
      eatchel.useSkill("ultimateSkill");
    }

    if (eatchel.canUseSkill("standardSkill")) {
      eatchel.useSkill("standardSkill");
    }

    if (eatchel.canShot()) {
      eatchel.useShot("ads");
    } else {
      eatchel.usePartialReload();
    }
  }
  return engine.historyManager.getPrettified();
}
