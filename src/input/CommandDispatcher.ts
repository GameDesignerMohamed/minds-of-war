/**
 * CommandDispatcher — translates player intent into typed game commands.
 *
 * Sits between the input layer and the game logic layer. It reads the current
 * selection from {@link SelectionManager}, determines the appropriate command
 * for a given input action, and publishes that command on the injected
 * {@link EventBus}. Gameplay systems subscribe to those events and execute
 * them; the UI never touches simulation state directly.
 *
 * Supported commands:
 * - Move:   right-click on empty ground → move selected units to position.
 * - Attack: right-click on an enemy entity → attack-move to target.
 * - Stop:   S key → halt all selected units.
 * - Patrol: P key → toggle patrol mode for selected units.
 * - Build:  dispatched programmatically from the command card UI.
 *
 * @example
 * const dispatcher = new CommandDispatcher(
 *   selectionManager,
 *   bus,
 *   entityAtPosition,
 *   'human',
 * );
 *
 * // On right-click (from InputManager):
 * dispatcher.issueRightClick({ x: 200, y: 150 });
 *
 * // On hotkey (from InputManager):
 * dispatcher.issueHotkey('KeyS');
 */

import { EventBus } from '@/core/EventBus';
import { SelectionManager } from './SelectionManager';
import type { EntityId, PlayerId, Position } from '@/types';
import { HealthType, OwnerType } from '@/ecs/components/GameComponents';
import type { OwnerComponent } from '@/ecs/components/GameComponents';
import { World } from '@/ecs/World';

// ---------------------------------------------------------------------------
// Command Event Map
// ---------------------------------------------------------------------------

/**
 * All commands that the CommandDispatcher can emit.
 *
 * Gameplay systems subscribe to these topics on the same bus instance.
 */
export interface CommandEvents {
  /**
   * Order selected units to move to a world-space grid position.
   */
  moveCommand: {
    entities: readonly EntityId[];
    target: Position;
    playerId: PlayerId;
  };

  /**
   * Order selected units to attack a specific entity.
   */
  attackCommand: {
    entities: readonly EntityId[];
    targetId: EntityId;
    playerId: PlayerId;
  };

  /**
   * Order selected units to stop immediately.
   */
  stopCommand: {
    entities: readonly EntityId[];
    playerId: PlayerId;
  };

  /**
   * Order selected units to patrol between their current position and a target.
   */
  patrolCommand: {
    entities: readonly EntityId[];
    target: Position;
    playerId: PlayerId;
  };

  /**
   * Order a worker unit to begin constructing a building at a grid position.
   */
  buildCommand: {
    workerEntity: EntityId;
    buildingType: string;
    target: Position;
    playerId: PlayerId;
  };
}

// ---------------------------------------------------------------------------
// CommandDispatcher
// ---------------------------------------------------------------------------

/**
 * Converts raw player input into game commands and publishes them on the bus.
 *
 * **Single-thread only.** All methods are synchronous and must be called from
 * the main thread.
 */
export class CommandDispatcher {
  private readonly _selection: SelectionManager;
  private readonly _bus: EventBus<CommandEvents>;
  private readonly _entityAtPosition: (pos: Position) => EntityId | null;
  private readonly _localPlayer: PlayerId;
  private readonly _world: World;

  /**
   * @param selection        - The current selection manager. Used to read the
   *                           active entity set when issuing commands.
   * @param bus              - Event bus on which command events are emitted.
   * @param world            - ECS world, used to determine if a click target
   *                           is an enemy unit.
   * @param entityAtPosition - Callback that resolves a canvas-space position
   *                           to an EntityId, or null. Shared with
   *                           SelectionManager; injected here separately so
   *                           this class has no dependency on the selection
   *                           system's internals.
   * @param localPlayer      - PlayerId of the human player.
   */
  constructor(
    selection: SelectionManager,
    bus: EventBus<CommandEvents>,
    world: World,
    entityAtPosition: (pos: Position) => EntityId | null,
    localPlayer: PlayerId,
  ) {
    this._selection = selection;
    this._bus = bus;
    this._world = world;
    this._entityAtPosition = entityAtPosition;
    this._localPlayer = localPlayer;
  }

  // -------------------------------------------------------------------------
  // Input handlers
  // -------------------------------------------------------------------------

  /**
   * Processes a right-click at the given canvas-space position.
   *
   * - If the click lands on a live, enemy entity → emits {@link attackCommand}.
   * - Otherwise → emits {@link moveCommand} to the target position.
   *
   * No-op when nothing is selected.
   *
   * @param pos - Canvas-space click coordinates (CSS pixels).
   */
  issueRightClick(pos: Position): void {
    const entities = this._selectedEntities();
    if (entities.length === 0) return;

    const targetEntity = this._entityAtPosition(pos);

    if (targetEntity !== null && this._isEnemy(targetEntity)) {
      this._bus.emit('attackCommand', {
        entities,
        targetId: targetEntity,
        playerId: this._localPlayer,
      });
    } else {
      this._bus.emit('moveCommand', {
        entities,
        target: pos,
        playerId: this._localPlayer,
      });
    }
  }

  /**
   * Processes a keyboard hotkey press.
   *
   * Supported codes:
   * - `'KeyS'` → Stop command
   * - `'KeyP'` + `targetPos` → Patrol command (target required)
   *
   * No-op when nothing is selected.
   *
   * @param code      - Browser KeyboardEvent.code value.
   * @param targetPos - Required for patrol; ignored for other hotkeys.
   */
  issueHotkey(code: string, targetPos?: Position): void {
    const entities = this._selectedEntities();
    if (entities.length === 0) return;

    switch (code) {
      case 'KeyS':
        this._bus.emit('stopCommand', {
          entities,
          playerId: this._localPlayer,
        });
        break;

      case 'KeyP':
        if (targetPos !== undefined) {
          this._bus.emit('patrolCommand', {
            entities,
            target: targetPos,
            playerId: this._localPlayer,
          });
        }
        break;

      default:
        // Unknown hotkey — no-op. Future hotkeys registered here.
        break;
    }
  }

  /**
   * Issues a build command from the command card UI.
   *
   * The caller is responsible for determining which worker entity to use
   * (typically the first selected worker). This method emits the typed event
   * without additional validation — it trusts the command card to only
   * surface valid build options for the current selection.
   *
   * @param workerEntity - The worker entity that will execute the build.
   * @param buildingType - String key identifying the building type (matches
   *                       the data-driven config entry).
   * @param target       - Grid-space position where the building will be placed.
   */
  issueBuild(workerEntity: EntityId, buildingType: string, target: Position): void {
    this._bus.emit('buildCommand', {
      workerEntity,
      buildingType,
      target,
      playerId: this._localPlayer,
    });
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Returns the current selection as a plain, non-empty array.
   *
   * Returns an empty array when nothing is selected, so callers can guard
   * with a length check.
   */
  private _selectedEntities(): EntityId[] {
    return Array.from(this._selection.selected);
  }

  /**
   * Returns `true` when the entity exists, has a health component (is a live
   * game object), and belongs to a player that is not the local player.
   *
   * Uses the presence of {@link HealthComponent} as a proxy for "alive" to
   * avoid importing a dedicated alive/dead component that does not yet exist.
   */
  private _isEnemy(entity: EntityId): boolean {
    if (!this._world.hasComponent(entity, HealthType)) return false;
    const owner = this._world.getComponent<OwnerComponent>(entity, OwnerType);
    if (owner === undefined) return false;
    return owner.playerId !== this._localPlayer;
  }
}
