# TODOS — Minds of War

Last updated: 2026-04-08

---

## Art Direction Overhaul — "Clean Kenney 3D"

**Goal:** Unify the visual style. Every entity uses Kenney 3D models. No sprites. No procedural geometry. Clean ground. Real shadows. Warm UI colors. The reference is Nicolas Zullo's Vibejam (same Kenney assets + Three.js).

**Art Rules:**
- ALL entities use Kenney 3D models (Fantasy Town Kit for buildings/props, Mini Characters for units)
- Ground is a single clean green plane, no tiled grass texture
- Shadows are mandatory (directional light + shadow maps)
- Consistent scale: characters ~1 unit tall, buildings ~2-3 units, trees ~2 units
- Warm color palette matching the Kenney colormap
- UI colors harmonize with brown wood panels (amber/gold, not cyan)

**Critical context for the agent:** The Kenney GLB files reference external textures at `Textures/colormap.png` relative to the GLB location. These textures are already deployed at:
- `public/art/models/buildings/Textures/colormap.png` (512x512, 11KB)
- `public/art/models/characters/Textures/colormap.png` (512x512, 9KB)

`src/rendering/ModelLoader.ts` already has building recipes and character mappings. It uses `GLTFLoader` from `three/examples/jsm/loaders/GLTFLoader.js`. Models are cached after first load.

---

### Step 1: Lighting + Shadows (DO THIS FIRST — biggest visual impact)

**Files:** `src/GameSetup.ts` and/or `src/rendering/SceneManager.ts`

**What to change:**
1. Enable shadow maps on the renderer:
   ```ts
   renderer.shadowMap.enabled = true;
   renderer.shadowMap.type = THREE.PCFSoftShadowMap;
   ```
2. Update the directional light (the "sun"):
   ```ts
   sun.castShadow = true;
   sun.shadow.mapSize.set(2048, 2048);
   sun.shadow.camera.left = -60;
   sun.shadow.camera.right = 60;
   sun.shadow.camera.top = 60;
   sun.shadow.camera.bottom = -60;
   sun.shadow.camera.near = 1;
   sun.shadow.camera.far = 200;
   sun.shadow.bias = -0.001;
   ```
3. Adjust ambient light to be softer/cooler:
   ```ts
   ambientLight.color.set(0xb0c4de); // cool blue-white
   ambientLight.intensity = 0.5;
   ```
4. Make the ground plane receive shadows: `ground.receiveShadow = true;`
5. In `ModelLoader.ts`, when loading models, traverse and set:
   ```ts
   node.castShadow = true;
   node.receiveShadow = true;
   ```

**Verify:** Buildings and characters cast shadows on the ground. The scene has visual depth.

---

### Step 2: Clean Ground Plane (remove tiled grass)

**Files:** `src/rendering/MeshFactory.ts` (terrain methods), `src/GameSetup.ts`

**What to change:**
1. Remove the terrain tile rendering system entirely (the `createTerrainLayer` / `createTerrainTile` methods that create noisy grass tiles)
2. Replace with a single large PlaneGeometry ground:
   ```ts
   const ground = new THREE.Mesh(
     new THREE.PlaneGeometry(MAP_W + 20, MAP_H + 20),
     new THREE.MeshStandardMaterial({ color: 0x5a8a3a, roughness: 0.9 })
   );
   ground.rotation.x = -Math.PI / 2;
   ground.position.set(MAP_W / 2, -0.01, MAP_H / 2);
   ground.receiveShadow = true;
   ```
3. Keep TileGrid for gameplay logic (walkability, pathfinding) — just stop rendering individual tiles
4. Map edges: slightly darker green border plane underneath to show boundaries

**Verify:** Clean flat green ground, no repeating texture noise. Matches Kenney's flat-shaded aesthetic.

---

### Step 3: ALL Entities Use Kenney 3D Models

**Files:** `src/rendering/MeshFactory.ts`, `src/rendering/ModelLoader.ts`, `src/GameSetup.ts`

**What to change:**

**3a. Remove the sprite rendering path:**
- In `MeshFactory.createUnitMesh()`: remove the call to `_createCharacterSprite()`. Do NOT try sprites first. Go straight to 3D model with procedural fallback.
- In `MeshFactory.createBuildingMesh()`: same — remove `_createBuildingSprite()` call.
- The sprite system (SpriteSheet.ts, SpriteAnimator.ts) can stay in the codebase but should not be called.

**3b. Fix the async model swap pattern in MeshFactory:**
- `createUnitMesh()` returns a wrapper Group with a simple colored box placeholder
- Async loads the Kenney character model and swaps it in via `wrapper.clear(); wrapper.add(model);`
- The placeholder should be a small colored box (faction color: blue for human, green for orc) so something is visible immediately

**3c. Fix the async model swap for buildings (same pattern):**
- `createBuildingMesh()` returns wrapper Group with colored box placeholder
- Async loads the composed Kenney building model and swaps in

**3d. Resource nodes:**
- Gold mines: keep the procedural yellow glowing octahedron (distinctive, readable)
- Trees: async load `buildings/tree.glb` from Kenney Fantasy Town Kit
- Already wired in `GameSetup.ts:spawnResourceNode()` via `loadResourceModel()`

**3e. Ensure ModelLoader.ts handles textures correctly:**
- The `loadModel()` function should use `gltf.scene` directly (not clone immediately)
- Set `colorSpace = THREE.SRGBColorSpace` on all texture maps
- Set `castShadow = true` and `receiveShadow = true` on all meshes
- Cache the original, return `clone(true)` for each instance

**Verify:** All buildings are colored Kenney models (lavender walls, red roofs). All characters are colored Kenney mini-character models. No 2D sprites visible. No procedural geometry boxes/cylinders.

---

### Step 4: Fix Model Scales

**File:** `src/rendering/ModelLoader.ts`

**What to change:**
The Kenney models are natively ~1 unit in size. Adjust scales so everything is proportional:

| Entity Type | Scale | Notes |
|-------------|-------|-------|
| Characters (all) | 1.0 | Kenney characters are ~1 unit tall, matches grid |
| Keep / Stronghold | 2.0 | Main HQ, should dominate |
| Barracks / War Camp | 1.5 | Medium buildings |
| Farm / War Hut | 1.2 | Small buildings |
| Watch Tower | 1.8 | Tall but narrow |
| Blacksmith / Forge | 1.3 | Medium |
| Other buildings | 1.3 | Default |
| Trees | 2.0 | Taller than characters |
| Gold mine (procedural) | N/A | Keep existing scale |

Test by placing a character next to each building type. Characters should be roughly chest-height relative to a 1-story building wall.

**Verify:** Screenshot shows natural proportions. Buildings are bigger than characters. Trees are taller than buildings.

---

### Step 5: Harmonize UI Colors

**Files:** `src/ui/HUD.ts`, `src/ui/SelectionPanel.ts`, `src/ui/CommandCard.ts`, `src/ui/MinimapRenderer.ts`

**What to change:**
Replace ALL cyan (#3df2c0) accents with warm amber/gold from the Kenney palette:

| Element | Old Color | New Color |
|---------|-----------|-----------|
| Resource values (Gold, Wood) | #3df2c0 (cyan) | #e8a840 (amber gold) |
| Clock display | #3df2c0 | #e8a840 |
| HP bar full | #3df2c0 | #6aaa3a (Kenney green) |
| HP bar low | #f2913d | #d4742a (warm orange) |
| Labels (GOLD, WOOD, etc) | rgba(255,255,255,0.45) | #c4a882 (warm tan) |
| Unit name text | #ffffff | #f5e6d0 (warm white) |
| Stat text | rgba(255,255,255,0.55) | #c4a882 (warm tan) |
| Selection ring | cyan | #e8a840 (amber) |
| Panel borders | rgba(61,242,192,...) | rgba(180,140,80,...) (warm brown) |
| Tutorial panel border | #3df2c0 | #c4a882 |
| Tutorial action text | #3df2c0 | #e8a840 |

Also update the minimap "MINIMAP" label color to match.

**Verify:** UI feels warm and cohesive with the brown Kenney wood panels. No cyan anywhere.

---

### Step 6: Scatter Decor Props

**Files:** New file `src/map/DecorScatter.ts`, modify `src/main.ts` to call it

**What to create:**
A function that places non-interactive decorative 3D models on the map:

```ts
export async function scatterDecor(scene: THREE.Scene, mapW: number, mapH: number): Promise<void> {
  // Place 20-30 small rocks randomly on grass areas
  // Place 10-15 bushes/hedges along map edges  
  // Avoid placing on starting positions or resource node locations
  // Use minimum distance between props (3-4 tiles)
}
```

**Kenney models to use as decor:**
- `rock-small.glb` — scatter on open grass (15-20 instances)
- `rock-wide.glb` — fewer, larger accent rocks (5-8 instances)
- `hedge.glb` — along map edges (10-15 instances)
- `fence.glb` — near player starting positions (4-6 instances)
- `lantern.glb` — near buildings (2-3 instances)

All decor is visual only — no ECS components, no collision, no gameplay effect. Just `scene.add(model)`.

**Verify:** Map feels populated. Empty grass areas have scattered rocks and bushes. Map edges have hedges.

---

### Step 7: Camera Tilt

**File:** `src/rendering/CameraController.ts`

**What to change:**
Current camera is pure top-down orthographic. Tilt it 15-20 degrees from vertical to create a slight isometric perspective:

```ts
// Instead of looking straight down:
camera.position.set(x, height, z);
camera.lookAt(x, 0, z);

// Look slightly forward:
camera.position.set(x, height, z - offset);
camera.lookAt(x, 0, z + lookAheadOffset);
```

This makes shadows visible from the player's perspective and gives buildings visible depth (you can see their front faces, not just rooftops).

**Verify:** Buildings show their front walls, not just rooftops. Shadows are visible extending from models. Scene feels 3D, not flat.

---

## Archived — Previous TODOs (completed or superseded)

<details>
<summary>Engineering fixes (E1-E17) — mostly completed in prior sessions</summary>

Most engineering TODOs from the original takeover review have been implemented across 23 commits. The art direction overhaul above supersedes the previous sprite-based art plan (Phases 1-5).

Key completed items:
- E2: main.ts extracted into modules
- E3: typed config interfaces
- E6/E7: test coverage (83 tests)
- E8: SceneManager owns THREE.Scene
- E9: shared TypeMappers
- E10: BuffEntry mutable
- E11: player ID constants
- E13: ESLint + Prettier
- E14: CI/CD pipeline
- E15: worker death handling

Remaining engineering items (lower priority than art overhaul):
- E1: tick rate 20Hz (check if done)
- E4: ResourceTracker.spend() guard
- E5: throw on missing unit defs
- E12: event-driven HP bars
- E16: abstract player identity
- E17: archetype ECS (deferred until 500+ entities)
</details>
