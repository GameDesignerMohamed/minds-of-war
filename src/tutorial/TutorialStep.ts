/**
 * TutorialStep — data definitions for the onboarding tutorial.
 *
 * Each step defines what to show, what to highlight, and when to advance.
 *
 * @module tutorial/TutorialStep
 */

import type { World } from '@/ecs/World';
import type { SelectionManager } from '@/input/SelectionManager';
import type { CameraController } from '@/rendering/CameraController';
import type { EntityId } from '@/types';
import { UnitType, BuildingType } from '@/ecs/components/GameComponents';
import type { UnitComponent, BuildingComponent } from '@/ecs/components/GameComponents';

// ---------------------------------------------------------------------------
// Step interface
// ---------------------------------------------------------------------------

export interface TutorialStep {
  id: string;
  title: string;
  body: string;
  stepNumber: number;
  totalSteps: number;

  /** Short hint shown below body text (e.g. "Pan the camera to continue"). */
  completionHint?: string;

  /** What to highlight on screen. */
  highlight: {
    type: 'ui' | 'none';
    uiSelector?: string;
  };

  /** How this step completes. */
  completion: {
    type: 'event' | 'poll' | 'timer';
    eventName?: string;
    eventFilter?: (payload: unknown) => boolean;
    pollCheck?: () => boolean;
    timerMs?: number;
  };
}

// ---------------------------------------------------------------------------
// Step factory
// ---------------------------------------------------------------------------

export interface TutorialContext {
  selectionMgr: SelectionManager;
  world: World;
  camCtrl: CameraController;
  getPlacementMode: () => string | null;
}

const TOTAL = 10;

export function createTutorialSteps(ctx: TutorialContext): TutorialStep[] {
  const { selectionMgr, world, camCtrl, getPlacementMode } = ctx;

  const startX = camCtrl.camera.position.x;
  const startZ = camCtrl.camera.position.z;

  function isWorkerSelected(): boolean {
    if (selectionMgr.selected.size === 0) return false;
    for (const eid of selectionMgr.selected) {
      const uc = world.getComponent<UnitComponent>(eid as EntityId, UnitType);
      if (uc?.isWorker) return true;
    }
    return false;
  }

  function isBuildingSelected(buildingId: string): boolean {
    for (const eid of selectionMgr.selected) {
      const bc = world.getComponent<BuildingComponent>(eid as EntityId, BuildingType);
      if (bc?.buildingId === buildingId) return true;
    }
    return false;
  }

  // Track whether placement was used (for step 7)
  const origGetPlacement = getPlacementMode;
  let wasInPlacement = false;

  return [
    // Step 1: Welcome + Camera
    {
      id: 'welcome',
      title: 'Welcome, Commander!',
      body: 'Welcome to Minds of War! Use WASD keys or move your mouse to the screen edges to pan the camera.',
      completionHint: '> Pan the camera to continue...',
      stepNumber: 1,
      totalSteps: TOTAL,
      highlight: { type: 'none' as const },
      completion: {
        type: 'poll' as const,
        pollCheck: () => {
          const dx = Math.abs(camCtrl.camera.position.x - startX);
          const dz = Math.abs(camCtrl.camera.position.z - startZ);
          return dx > 3 || dz > 3;
        },
      },
    },

    // Step 2: Select a worker
    {
      id: 'select-worker',
      title: 'Select a Worker',
      body: "Left-click on one of your Peasant workers to select them. You'll see a cyan ring appear around them.",
      completionHint: '> Click a Peasant to continue...',
      stepNumber: 2,
      totalSteps: TOTAL,
      highlight: { type: 'none' as const },
      completion: {
        type: 'poll' as const,
        pollCheck: () => isWorkerSelected(),
      },
    },

    // Step 3: Harvest gold
    {
      id: 'harvest-gold',
      title: 'Harvest Gold',
      body: 'With your worker selected, right-click on a Gold Mine (the glowing yellow crystal) to begin harvesting.',
      completionHint: '> Right-click a Gold Mine. Wait for the worker to deliver gold...',
      stepNumber: 3,
      totalSteps: TOTAL,
      highlight: { type: 'none' as const },
      completion: {
        type: 'event' as const,
        eventName: 'RESOURCE_DEPOSITED',
        eventFilter: (d: unknown) => {
          const e = d as { playerId?: string; kind?: string };
          return e.playerId === 'human' && e.kind === 'gold';
        },
      },
    },

    // Step 4: Watch resources
    {
      id: 'watch-resources',
      title: 'Resources Incoming!',
      body: 'Your worker is gathering gold! Watch the Gold counter increase in the resource bar at the top.',
      stepNumber: 4,
      totalSteps: TOTAL,
      highlight: { type: 'ui' as const, uiSelector: '#hud-gold' },
      completion: { type: 'timer' as const, timerMs: 4000 },
    },

    // Step 5: Select worker for building
    {
      id: 'select-worker-build',
      title: 'Select a Worker',
      body: "Select an idle Peasant worker. We're going to build a Farm to increase your supply cap.",
      completionHint: '> Click a Peasant to continue...',
      stepNumber: 5,
      totalSteps: TOTAL,
      highlight: { type: 'none' as const },
      completion: {
        type: 'poll' as const,
        pollCheck: () => isWorkerSelected(),
      },
    },

    // Step 6: Build a Farm
    {
      id: 'build-farm',
      title: 'Build a Farm',
      body: 'Press Q or click "Build Farm" in the command card (bottom-right) to enter build mode.',
      completionHint: '> Press Q or click Build Farm...',
      stepNumber: 6,
      totalSteps: TOTAL,
      highlight: { type: 'ui' as const, uiSelector: '#command-card' },
      completion: {
        type: 'poll' as const,
        pollCheck: () => {
          const m = origGetPlacement();
          if (m !== null) wasInPlacement = true;
          return m !== null;
        },
      },
    },

    // Step 7: Place the farm — advances when player exits placement mode (building was placed)
    {
      id: 'place-farm',
      title: 'Place the Farm',
      body: 'Click on an open area near your Keep to place the Farm. Your worker will start building it.',
      completionHint: '> Click the ground to place the Farm...',
      stepNumber: 7,
      totalSteps: TOTAL,
      highlight: { type: 'none' as const },
      completion: {
        type: 'poll' as const,
        pollCheck: () => {
          // Detect: was in placement mode, now exited (building placed or cancelled)
          const current = origGetPlacement();
          if (wasInPlacement && current === null) {
            return true;
          }
          return false;
        },
      },
    },

    // Step 8: Select Keep
    {
      id: 'select-keep',
      title: 'Select Your Keep',
      body: 'Left-click on your Keep (the large building with the tower and flag) to select it.',
      completionHint: '> Click the Keep to continue...',
      stepNumber: 8,
      totalSteps: TOTAL,
      highlight: { type: 'none' as const },
      completion: {
        type: 'poll' as const,
        pollCheck: () => isBuildingSelected('keep'),
      },
    },

    // Step 9: Train a Peasant
    {
      id: 'train-peasant',
      title: 'Train a Peasant',
      body: 'Press Q or click "Train Peasant" in the command card to queue a new worker. It costs 75 gold.',
      completionHint: '> Press Q or click Train Peasant...',
      stepNumber: 9,
      totalSteps: TOTAL,
      highlight: { type: 'ui' as const, uiSelector: '#command-card' },
      completion: {
        type: 'event' as const,
        eventName: 'UNIT_QUEUED',
        eventFilter: (d: unknown) => {
          const e = d as { playerId?: string };
          return e.playerId === 'human';
        },
      },
    },

    // Step 10: Complete
    {
      id: 'complete',
      title: 'Tutorial Complete!',
      body: "You're ready! Build a Barracks to train combat units, then destroy the Orc Stronghold to win. Good luck, Commander!",
      stepNumber: 10,
      totalSteps: TOTAL,
      highlight: { type: 'none' as const },
      completion: { type: 'timer' as const, timerMs: 6000 },
    },
  ];
}
