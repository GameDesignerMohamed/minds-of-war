import * as THREE from 'three';

export const DEFAULT_SPRITE_DIRECTIONS = [
  'south',
  'south_east',
  'east',
  'north_east',
  'north',
  'north_west',
  'west',
  'south_west',
] as const;

export type SpriteDirection = (typeof DEFAULT_SPRITE_DIRECTIONS)[number];

export interface SpriteSheetStateDefinition {
  textureUrl: string;
  frameCount: number;
  fps: number;
  loop?: boolean;
  startColumn?: number;
  sheetWidth?: number;
  sheetHeight?: number;
}

export interface SpriteSheetDefinition {
  id: string;
  frameWidth: number;
  frameHeight: number;
  defaultState: string;
  directions?: readonly SpriteDirection[];
  scale?: {
    x: number;
    y: number;
  };
  sheetWidth?: number;
  sheetHeight?: number;
  states: Record<string, SpriteSheetStateDefinition>;
}

export interface SpriteSheetLoadOptions {
  fetchJson?: (url: string) => Promise<SpriteSheetDefinition>;
  textureLoader?: Pick<THREE.TextureLoader, 'loadAsync'>;
}

export interface SpriteAnimationDefinition {
  state: string;
  frameCount: number;
  fps: number;
  loop: boolean;
}

export interface SpriteFrame {
  texture: THREE.Texture;
  state: string;
  direction: SpriteDirection;
  frame: number;
  fps: number;
  loop: boolean;
  uvOffset: {
    x: number;
    y: number;
  };
  uvRepeat: {
    x: number;
    y: number;
  };
  scale: {
    x: number;
    y: number;
  };
}

interface LoadedStateData {
  texture: THREE.Texture;
  frameCount: number;
  fps: number;
  loop: boolean;
  startColumn: number;
  sheetWidth: number;
  sheetHeight: number;
}

const ABSOLUTE_URL_PATTERN = /^(?:[a-z]+:)?\/\//i;

function normalizeTexture(texture: THREE.Texture): THREE.Texture {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function resolveAssetUrl(url: string, baseUrl?: string): string {
  if (ABSOLUTE_URL_PATTERN.test(url) || url.startsWith('/')) {
    return url;
  }

  if (baseUrl === undefined || baseUrl.length === 0) {
    return url;
  }

  try {
    return new URL(url, baseUrl).toString();
  } catch {
    const normalizedBase = baseUrl.slice(0, baseUrl.lastIndexOf('/') + 1);
    return `${normalizedBase}${url}`.replace(/\/\.\//g, '/');
  }
}

function inferSheetDimension(
  explicitSize: number | undefined,
  fallbackSize: number | undefined,
  textureSize: number | undefined,
  defaultSize: number,
): number {
  return explicitSize ?? fallbackSize ?? textureSize ?? defaultSize;
}

function modulo(value: number, length: number): number {
  return ((value % length) + length) % length;
}

export class SpriteSheet {
  readonly id: string;
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly defaultState: string;
  readonly directions: readonly SpriteDirection[];
  readonly scale: Readonly<{ x: number; y: number }>;

  private readonly _states: Map<string, LoadedStateData>;

  constructor(definition: SpriteSheetDefinition, stateTextures: Record<string, THREE.Texture>) {
    if (!(definition.defaultState in definition.states)) {
      throw new Error(
        `SpriteSheet "${definition.id}" is missing its default state "${definition.defaultState}"`,
      );
    }

    this.id = definition.id;
    this.frameWidth = definition.frameWidth;
    this.frameHeight = definition.frameHeight;
    this.defaultState = definition.defaultState;
    this.directions = definition.directions ?? DEFAULT_SPRITE_DIRECTIONS;
    this.scale = definition.scale ?? { x: 1, y: 1 };
    this._states = new Map();

    for (const [stateName, stateDefinition] of Object.entries(definition.states)) {
      const texture = stateTextures[stateName];
      if (texture === undefined) {
        throw new Error(
          `SpriteSheet "${definition.id}" is missing a texture for state "${stateName}"`,
        );
      }

      const textureImage = texture.image as { width?: number; height?: number } | undefined;
      const startColumn = stateDefinition.startColumn ?? 0;
      const sheetWidth = inferSheetDimension(
        stateDefinition.sheetWidth,
        definition.sheetWidth,
        textureImage?.width,
        this.frameWidth * (startColumn + stateDefinition.frameCount),
      );
      const sheetHeight = inferSheetDimension(
        stateDefinition.sheetHeight,
        definition.sheetHeight,
        textureImage?.height,
        this.frameHeight * this.directions.length,
      );

      this._states.set(stateName, {
        texture: normalizeTexture(texture),
        frameCount: stateDefinition.frameCount,
        fps: stateDefinition.fps,
        loop: stateDefinition.loop ?? true,
        startColumn,
        sheetWidth,
        sheetHeight,
      });
    }
  }

  static fromDefinition(
    definition: SpriteSheetDefinition,
    stateTextures: Record<string, THREE.Texture>,
  ): SpriteSheet {
    return new SpriteSheet(definition, stateTextures);
  }

  static async load(
    manifestUrl: string,
    options: SpriteSheetLoadOptions = {},
  ): Promise<SpriteSheet> {
    const fetchJson =
      options.fetchJson ??
      (async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load sprite manifest: ${url}`);
        }
        return response.json() as Promise<SpriteSheetDefinition>;
      });
    const textureLoader = options.textureLoader ?? new THREE.TextureLoader();
    const definition = await fetchJson(manifestUrl);

    const textures = await Promise.all(
      Object.entries(definition.states).map(async ([stateName, stateDefinition]) => {
        const textureUrl = resolveAssetUrl(stateDefinition.textureUrl, manifestUrl);
        const texture = await textureLoader.loadAsync(textureUrl);
        return [stateName, texture] as const;
      }),
    );

    return new SpriteSheet(definition, Object.fromEntries(textures));
  }

  hasState(state: string): boolean {
    return this._states.has(state);
  }

  listStates(): string[] {
    return [...this._states.keys()];
  }

  getAnimation(state = this.defaultState): SpriteAnimationDefinition {
    const stateData = this._getState(state);
    return {
      state,
      frameCount: stateData.frameCount,
      fps: stateData.fps,
      loop: stateData.loop,
    };
  }

  resolveFrame(
    state = this.defaultState,
    direction: SpriteDirection = this.directions[0] ?? DEFAULT_SPRITE_DIRECTIONS[0],
    frameIndex = 0,
  ): SpriteFrame {
    const stateData = this._getState(state);
    const directionIndex = this._directionIndex(direction);
    const normalizedFrame = modulo(frameIndex, stateData.frameCount);

    const repeatX = this.frameWidth / stateData.sheetWidth;
    const repeatY = this.frameHeight / stateData.sheetHeight;
    const column = stateData.startColumn + normalizedFrame;

    return {
      texture: stateData.texture,
      state,
      direction,
      frame: normalizedFrame,
      fps: stateData.fps,
      loop: stateData.loop,
      uvOffset: {
        x: column * repeatX,
        y: 1 - (directionIndex + 1) * repeatY,
      },
      uvRepeat: {
        x: repeatX,
        y: repeatY,
      },
      scale: this.scale,
    };
  }

  private _getState(state: string): LoadedStateData {
    const stateData = this._states.get(state);
    if (stateData === undefined) {
      throw new Error(`SpriteSheet "${this.id}" has no state named "${state}"`);
    }
    return stateData;
  }

  private _directionIndex(direction: SpriteDirection): number {
    const index = this.directions.indexOf(direction);
    if (index === -1) {
      throw new Error(`SpriteSheet "${this.id}" does not support direction "${direction}"`);
    }
    return index;
  }
}
