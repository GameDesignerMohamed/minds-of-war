import * as THREE from 'three';
import { GameLoop } from '@/core/GameLoop';
import { EventBus } from '@/core/EventBus';
import { EdgeScroll } from '@/input/EdgeScroll';
import { SelectionPanel } from '@/ui/SelectionPanel';
import { MinimapRenderer } from '@/ui/MinimapRenderer';
import { FogOfWarRenderer } from '@/rendering/FogOfWarRenderer';
import { EffectsSystem } from '@/rendering/EffectsSystem';
import { CameraController } from '@/rendering/CameraController';
import { HpBarSystem } from '@/rendering/HpBarSystem';
import { SceneManager } from '@/rendering/SceneManager';
import { TutorialController } from '@/tutorial/TutorialController';
import { World } from '@/ecs/World';
import type { HUDEvents } from '@/ui/HUD';
import type { SelectionManager } from '@/input/SelectionManager';
import { HealthType, PositionType } from '@/ecs/components/GameComponents';

export interface GameRendererParams {
  renderer: THREE.WebGLRenderer;
  sceneManager: SceneManager;
  cameraController: CameraController;
  world: World;
  hpBarSystem: HpBarSystem;
  selectionPanel: SelectionPanel;
  selectionManager: SelectionManager;
  minimap: MinimapRenderer;
  fogRenderer: FogOfWarRenderer;
  effectsSystem: EffectsSystem;
  tutorial: TutorialController;
  hudBus: EventBus<HUDEvents>;
}

export function createGameRenderer({
  renderer,
  sceneManager,
  cameraController,
  world,
  hpBarSystem,
  selectionPanel,
  selectionManager,
  minimap,
  fogRenderer,
  effectsSystem,
  tutorial,
  hudBus,
}: GameRendererParams): GameLoop {
  const edgeScroll = new EdgeScroll(20);
  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  const keys: Record<string, boolean> = {};
  window.addEventListener('keydown', (event) => {
    keys[event.key.toLowerCase()] = true;
  });
  window.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
  });

  let gameTime = 0;
  let lastFrameTime = performance.now();
  const hpVector = new THREE.Vector3();

  const loop = new GameLoop(
    { tickRate: 1 / 20, maxFrameTime: 0.25 },
    (deltaTime) => {
      try {
        world.update(deltaTime);
      } catch (error) {
        console.error('[TICK]', error);
      }
      gameTime += deltaTime;
    },
    () => {
      const now = performance.now();
      const frameDelta = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;

      const keyboardHorizontal = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);
      const keyboardVertical = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);
      const edgePan = edgeScroll.update(mouseX, mouseY, innerWidth, innerHeight);
      const panHorizontal = THREE.MathUtils.clamp(keyboardHorizontal + edgePan.horizontal, -1, 1);
      const panVertical = THREE.MathUtils.clamp(keyboardVertical + edgePan.vertical, -1, 1);
      cameraController.update(frameDelta, { horizontal: panHorizontal, vertical: panVertical });

      selectionPanel.refresh(selectionManager.selected);
      minimap.update();
      minimap.drawViewport(cameraController.camera.position.x, cameraController.camera.position.z);
      fogRenderer.update();
      effectsSystem.update(frameDelta);
      tutorial.poll();
      hudBus.emit('clockUpdate', { seconds: Math.floor(gameTime) });

      renderer.render(sceneManager.threeScene, cameraController.camera);

      cameraController.camera.updateMatrixWorld(true);
      cameraController.camera.updateProjectionMatrix();
      for (const [entityId, position] of world.query(PositionType)) {
        const health = world.getComponent(entityId, HealthType);
        if (!health) {
          continue;
        }

        if (health.current < health.max && health.current > 0) {
          if (!hpBarSystem.hasBar(entityId)) {
            hpBarSystem.registerBar(entityId);
          }
          hpVector.set(position.x, 2.0, position.z);
          hpBarSystem.updateBar(
            entityId,
            health.current,
            health.max,
            hpVector,
            cameraController.camera,
          );
        } else if (hpBarSystem.hasBar(entityId) && health.current >= health.max) {
          hpBarSystem.removeBar(entityId);
        }
      }
    },
  );

  window.addEventListener('resize', () => {
    cameraController.onResize(innerWidth, innerHeight);
    renderer.setSize(innerWidth, innerHeight);
  });

  return loop;
}
