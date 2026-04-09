import { ArmorType, AttackType } from '../types';

const ATTACK_TYPE_MAP: Record<string, AttackType> = {
  normal: AttackType.Normal,
  pierce: AttackType.Pierce,
  siege: AttackType.Siege,
  magic: AttackType.Magic,
};

const ARMOR_TYPE_MAP: Record<string, ArmorType> = {
  light: ArmorType.Light,
  medium: ArmorType.Medium,
  heavy: ArmorType.Heavy,
  fortified: ArmorType.Fortified,
};

export function toAttackType(value: string): AttackType {
  return ATTACK_TYPE_MAP[value.toLowerCase()] ?? AttackType.Normal;
}

export function toArmorType(value: string): ArmorType {
  return ARMOR_TYPE_MAP[value.toLowerCase()] ?? ArmorType.Light;
}
