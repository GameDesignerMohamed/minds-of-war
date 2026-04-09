/**
 * PlayerConfig helpers — separate player slot identity from faction identity.
 *
 * `PlayerConfig.id` is the owning slot (`player1`, `ai-1`, `local`, etc).
 * `PlayerConfig.faction` selects which faction data that slot should use.
 *
 * When `source.players` is absent, helpers derive a legacy mapping from the
 * currently shipped faction data so older `human` / `orc` callers keep working.
 */

export interface PlayerConfig {
  id: string;
  faction: string;
}

interface FactionIdentitySource {
  faction: string;
}

export interface PlayerConfigSource {
  players?: readonly PlayerConfig[];
  humanUnits?: FactionIdentitySource;
  orcUnits?: FactionIdentitySource;
  humanBuildings?: FactionIdentitySource;
  orcBuildings?: FactionIdentitySource;
}

function collectLegacyPlayers(source: PlayerConfigSource): PlayerConfig[] {
  const playersById = new Map<string, PlayerConfig>();
  const legacyFactionSources = [
    source.humanUnits,
    source.orcUnits,
    source.humanBuildings,
    source.orcBuildings,
  ];

  for (const factionSource of legacyFactionSources) {
    if (factionSource === undefined || playersById.has(factionSource.faction)) {
      continue;
    }

    playersById.set(factionSource.faction, {
      id: factionSource.faction,
      faction: factionSource.faction,
    });
  }

  return [...playersById.values()];
}

export function getPlayerConfigs(source: PlayerConfigSource): readonly PlayerConfig[] {
  if (Array.isArray(source.players) && source.players.length > 0) {
    return source.players;
  }

  return collectLegacyPlayers(source);
}

export function createPlayerConfigIndex(source: PlayerConfigSource): Map<string, PlayerConfig> {
  const playerConfigs = new Map<string, PlayerConfig>();

  for (const player of getPlayerConfigs(source)) {
    if (playerConfigs.has(player.id)) {
      throw new Error(`Duplicate player slot: ${player.id}`);
    }

    playerConfigs.set(player.id, player);
  }

  return playerConfigs;
}

export function requirePlayerConfig(
  playerConfigs: ReadonlyMap<string, PlayerConfig>,
  playerId: string,
): PlayerConfig {
  const player = playerConfigs.get(playerId);
  if (player !== undefined) {
    return player;
  }

  throw new Error(`Unknown player slot: ${playerId}`);
}

export function createFactionIndex<T extends FactionIdentitySource>(
  records: readonly T[],
): Map<string, T> {
  const factions = new Map<string, T>();

  for (const record of records) {
    if (factions.has(record.faction)) {
      throw new Error(`Duplicate faction config: ${record.faction}`);
    }

    factions.set(record.faction, record);
  }

  return factions;
}
