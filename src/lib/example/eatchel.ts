import { Eatchel } from "../characters/Eatchel";
import { BlitzingFangs } from "../weapons/shotguns/BlitzingFangs";
import { Engine } from "../engine/Engine";
import { AmanoIwato } from "~/lib/logistics/AmanoIwato";
import { Kaguya } from "~/lib/characters/Kaguya/Kaguya";
import { PrismaticIgniter } from "~/lib/weapons/pistols/PrismaticIgniter";
import { Amarna } from "~/lib/logistics/Amarna";
import { LittleSunshine } from "~/lib/characters/LittleSunshine/LittleSunshine";
import { StrawberryShortcake } from "~/lib/weapons/assaultRifles/StrawberryShortcake";

export function eatchelExample() {
  const engine = new Engine({
    damage: {
      alwaysHitWeakPoint: true,
    },
    enemy: {
      dealDamageEveryNSeconds: 3,
    },
  });

  const eatchel = new Eatchel(engine, { lvl: 80, manifestation: 0 });
  eatchel.equipWeapon(new BlitzingFangs(engine, { lvl: 80, tier: 2 }));
  eatchel.equipLogistics(
    new AmanoIwato(engine, [
      { "atk%": 8.5, "critDmg%": 9, "kineticDmg%": 7.2 },
      { "atk%": 8.5, "critDmg%": 9, "kineticDmg%": 7.2 },
      { "atk%": 8.5, "critDmg%": 9, "kineticDmg%": 7.2 },
    ]),
  );

  const kaguya = new Kaguya(engine, { lvl: 80, manifestation: 0 });
  kaguya.equipWeapon(new PrismaticIgniter(engine, { lvl: 80, tier: 1 }));
  kaguya.equipLogistics(
    new Amarna(engine, [
      { "atk%": 8.5, skillHaste: 16.4, "kineticDmg%": 3.4 },
      { "atk%": 8.5, "sEnergyRecovery%": 12, "kineticDmg%": 3.4 },
      { "atk%": 8.5, "sEnergyRecovery%": 12, "kineticDmg%": 3.4 },
    ]),
  );

  const littleSunshine = new LittleSunshine(engine, {
    lvl: 80,
    manifestation: 1,
  });
  littleSunshine.equipWeapon(
    new StrawberryShortcake(engine, { lvl: 80, tier: 1 }),
  );
  littleSunshine.equipLogistics(
    new Amarna(engine, [
      { "atk%": 8.5, "sEnergyRecovery%": 12, "thermalDmg%": 7.2 },
      { "atk%": 8.5, "sEnergyRecovery%": 12, "thermalDmg%": 7.2 },
      { "atk%": 8.5, "sEnergyRecovery%": 12, "thermalDmg%": 7.2 },
    ]),
  );

  return engine;
}
