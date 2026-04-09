import artManifestJson from '@/art/artManifest.json';

export type CharacterState = 'idle' | 'walk' | 'attack' | 'hurt' | 'death';
export type UiFrameId = 'panel' | 'button' | 'minimap' | 'portrait';

export interface WorldScale {
  x: number;
  y: number;
}

export interface CharacterStateSheet {
  src: string;
  frameSize: number;
  frameCount: number;
  rowCount: number;
  directionOrder: string[];
}

interface CharacterArtEntry {
  faction: string;
  portrait: string;
  worldScale: WorldScale;
  states: Record<CharacterState, CharacterStateSheet>;
}

interface BuildingArtEntry {
  faction: string;
  sprite: string;
  portrait: string;
  worldScale: WorldScale;
}

interface UiFrameEntry {
  src: string;
  slice: number;
}

interface ArtManifest {
  version: string;
  characters: Record<string, CharacterArtEntry>;
  buildings: Record<string, BuildingArtEntry>;
  icons: {
    resources: Record<string, string>;
    commands: Record<string, string>;
    abilities: Record<string, string>;
  };
  ui: {
    frames: Record<UiFrameId, UiFrameEntry>;
  };
  vfx: Record<string, string>;
}

const artManifest = artManifestJson as ArtManifest;

export function getArtManifest(): ArtManifest {
  return artManifest;
}

export function getCharacterArt(actorId: string): CharacterArtEntry | null {
  return artManifest.characters[actorId] ?? null;
}

export function getCharacterStateSheet(
  actorId: string,
  state: CharacterState = 'idle',
): CharacterStateSheet | null {
  return artManifest.characters[actorId]?.states[state] ?? null;
}

export function getBuildingArt(buildingId: string): BuildingArtEntry | null {
  return artManifest.buildings[buildingId] ?? null;
}

export function getPortraitPath(entityId: string): string | null {
  return (
    artManifest.characters[entityId]?.portrait ?? artManifest.buildings[entityId]?.portrait ?? null
  );
}

export function getCommandIconPath(commandId: string): string | null {
  return artManifest.icons.commands[commandId] ?? null;
}

export function getAbilityIconPath(abilityId: string): string | null {
  return artManifest.icons.abilities[abilityId] ?? null;
}

export function getResourceIconPath(resourceId: 'gold' | 'wood' | 'supply'): string | null {
  return artManifest.icons.resources[resourceId] ?? null;
}

export function getUiFrame(frameId: UiFrameId): UiFrameEntry | null {
  return artManifest.ui.frames[frameId] ?? null;
}

export function getVfxTexturePath(effectId: string): string | null {
  return artManifest.vfx[effectId] ?? null;
}

export function applyUiFrameStyles(
  element: HTMLElement,
  frameId: UiFrameId,
  borderWidth?: number,
  backgroundColor?: string,
): void {
  const frame = getUiFrame(frameId);
  if (!frame) {
    return;
  }

  const resolvedBorderWidth = borderWidth ?? Math.max(4, Math.round(frame.slice * 0.5));
  element.style.border = `${resolvedBorderWidth}px solid transparent`;
  element.style.borderImageSource = `url(${frame.src})`;
  element.style.borderImageSlice = `${frame.slice} fill`;
  element.style.borderImageWidth = `${resolvedBorderWidth}px`;
  element.style.borderImageRepeat = 'stretch';

  if (backgroundColor !== undefined) {
    element.style.background = backgroundColor;
  }
}
