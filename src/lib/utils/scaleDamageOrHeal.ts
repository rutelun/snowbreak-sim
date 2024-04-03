import type { DamageOrHealValue } from "~/lib/engine/DamageAndHealManager";

export function scaleDamageOrHeal(
  value: DamageOrHealValue,
  scale: number,
): DamageOrHealValue {
  return {
    type: value.type,
    percent: (value.percent ?? 0) * scale,
    flat: (value.flat ?? 0) * scale,
  };
}
