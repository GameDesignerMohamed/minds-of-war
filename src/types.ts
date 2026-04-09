/**
 * Core type definitions for Minds of War.
 *
 * Enums, interfaces, and type aliases shared across all game systems.
 * No runtime logic lives here — pure type declarations only.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Combat damage category, determines interactions with ArmorType via damage matrix. */
export enum AttackType {
  Normal = 'Normal',
  Pierce = 'Pierce',
  Siege = 'Siege',
  Magic = 'Magic',
}

/** Unit or structure armor class, determines damage modifier received. */
export enum ArmorType {
  Light = 'Light',
  Medium = 'Medium',
  Heavy = 'Heavy',
  Fortified = 'Fortified',
}

/** Playable factions in Minds of War. */
export enum Faction {
  Human = 'Human',
  Orc = 'Orc',
}

/** Map tile terrain categories, affect movement speed and line-of-sight. */
export enum TerrainType {
  Grassland = 'Grassland',
  Forest = 'Forest',
  Cliff = 'Cliff',
  Road = 'Road',
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/** Grid-space position on the simulation map. x = column, z = row. */
export interface Position {
  x: number;
  z: number;
}

/** Resource cost to train a unit or construct a building. */
export interface Cost {
  gold: number;
  wood: number;
}

// ---------------------------------------------------------------------------
// Type Aliases
// ---------------------------------------------------------------------------

/** Unique numeric identifier for any entity in the ECS world. */
export type EntityId = number;

/** Discriminated union of the two playable factions as string literals. */
export type PlayerId = 'human' | 'orc';
