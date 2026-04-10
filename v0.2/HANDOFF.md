# Minds of War v0.2 — Kenney 3D Model Integration

**Handoff Package for Implementation Agents**
Generated: 2026-04-10
Repo: GameDesignerMohamed/minds-of-war
Branch: main

---

## TL;DR

Replace all placeholder sprites and procedural geometry with real Kenney 3D GLB models. 179 GLB files exist in `Art/` unused. Build a ModelLoader with GLTFLoader, compose buildings from modular wall/roof/door parts via recipes, map characters 1:1 to mini-character GLBs, and use the async swap pattern (sync placeholder box, fire-and-forget GLB load, swap when ready).

---

## Problem

The game works mechanically (AI, economy, combat, fog of war, tutorial, 86 tests passing) but looks like a prototype. Entities render as tiny placeholder sprites and procedural box geometry instead of the Kenney 3D models. For a game jam, visual first impressions are everything.

## Asset Inventory

- `Art/kenney_fantasy-town-kit_2.0/Models/GLB format/` — 167 building/prop GLBs + `Textures/colormap.png`
- `Art/kenney_mini-characters/Models/GLB format/` — 12 character GLBs + `Textures/colormap.png`
- Total relevant: 179 GLB files

## Already Completed (this session, don't redo)

- Shadows enabled (renderer.shadowMap + PCFSoft + shadow camera covers 96x96 map)
- Clean ground plane (terrain tiles removed, flat green MeshStandardMaterial 0x5a8a3a)
- UI colors harmonized (all cyan #3df2c0 → amber #e8a840, 33 references across 9 files)
- Selection ring amber (UnitFactory + BuildingFactory)
- Camera tilt (offset 0,40,18), zoom (baseViewWidth 35)
- Character sprite scales bumped 1.5x in artManifest.json
- Decor scatter (procedural rocks + bushes, will be replaced with GLB)
- Scene background 0x1a2a1a, ambient light 0xb0c4de at 0.6
- Directional light target centered on map (48,0,48)
- Standalone repo at GameDesignerMohamed/minds-of-war (Donchitos remote removed)

---

## Implementation Steps

### Step 1: Copy GLB Assets to public/

```bash
cp -r "Art/kenney_fantasy-town-kit_2.0/Models/GLB format/"* public/models/buildings/
cp -r "Art/kenney_mini-characters/Models/GLB format/"* public/models/characters/
```

Ensure `Textures/colormap.png` is inside each directory (GLBs reference it relatively).

### Step 2: Write DESIGN.md

Document the visual system so future agents don't break it:
- Kenney flat-shaded 3D aesthetic
- Warm amber/gold UI accent color (#e8a840)
- Brown wood panel UI frames (Kenney UI Pack Adventure)
- Poppins (headings) + Space Mono (values) typography
- Cool-white ambient light (0xb0c4de), warm directional (0xfff5e0)
- Clean green ground plane (0x5a8a3a)
- Orthographic camera with slight isometric tilt

### Step 3: Create src/rendering/ModelLoader.ts (NEW FILE)

Async GLB loader with caching, building recipes, character mappings.

```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
```

**Core API:**
- `loadModel(path: string): Promise<THREE.Group>` — load GLB, cache original, return clone(true)
- `loadCharacter(unitId: string, faction: Faction): Promise<THREE.Group>` — load + faction tint
- `loadBuilding(buildingId: string, faction: Faction): Promise<THREE.Group>` — compose recipe parts
- `loadProp(name: string): Promise<THREE.Group>` — load single prop GLB
- `preloadCommon(): Promise<void>` — preload ~15 unique GLBs used in recipes (called during init)

**On every loaded model:**
- Traverse meshes: `castShadow = true`, `receiveShadow = true`
- Set `colorSpace = THREE.SRGBColorSpace` on texture maps
- Cache original scene, return `clone(true)` for each instance

**Parameterized recipes (9 recipes, not 18):**
Human/Orc variants differ only by wall type (stone vs wood) and accent (banner-green vs banner-red). Use a `wallVariant(faction)` function.

### Building Recipe Table

| Building | Parts | Offsets (x,y,z) | Scale |
|---|---|---|---|
| keep / stronghold | wall x4, roof-high-point, banner | (0,0,0), (1,0,0), (0,0,1), (1,0,1), (0.5,1,0.5), (0.5,1.5,0) | 2.0 |
| barracks / war_camp | wall x2, wall-door, roof | (0,0,0), (1,0,0), (0.5,0,1), (0.5,1,0.5) | 1.5 |
| farm / war_hut | fence x4, stall | (0,0,0), (1,0,0), (0,0,1), (1,0,1), (0.5,0,0.5) | 1.2 |
| watch_tower / watch_post | wall, wall (y+1), roof-point | (0,0,0), (0,1,0), (0,2,0) | 1.8 |
| blacksmith / war_forge | wall x3 (L-shape), chimney, roof | (0,0,0), (1,0,0), (0,0,1), (1,0.5,0), (0.5,1,0.5) | 1.3 |
| sanctum / spirit_lodge | wall-arch x2, roof-high-point, lantern | (0,0,0), (1,0,0), (0.5,1,0.5), (0.5,0,1.2) | 1.3 |
| workshop / siege_pit | wall x3, roof, wheel | (0,0,0), (1,0,0), (2,0,0), (1,1,0), (2.5,0.5,0) | 1.3 |
| archery_range / beast_den | fence x3, stall, poles-horizontal | (0,0,0), (1,0,0), (2,0,0), (1,0,1), (1,1,0.5) | 1.3 |

**Note:** Offsets are starting estimates. Visual QA pass required. Human buildings use `wall.glb`, Orc buildings use `wall-wood.glb`. Same offsets.

### Character Mapping Table

| Game Unit | GLB File | Scale |
|---|---|---|
| peasant / thrall | character-male-a.glb | 1.0 |
| footman / grunt | character-male-b.glb | 1.0 |
| archer / hunter | character-male-c.glb | 1.0 |
| knight / berserker | character-male-d.glb | 1.0 |
| cleric / shaman | character-female-a.glb | 1.0 |
| captain / warlord | character-male-e.glb | 1.0 |
| catapult / war_catapult | (keep procedural) | — |

**Faction tinting:** After cloning, traverse meshes and multiply material.color by faction tint (Human: 0x3366bb, Orc: 0x44882a).

### Resource & Prop Mapping

| Entity | GLB File | Scale |
|---|---|---|
| wood (tree) | tree.glb | 2.0 |
| gold mine | (keep procedural octahedron) | — |
| decor rocks | rock-small.glb, rock-large.glb, rock-wide.glb | 1.0 |
| decor hedges | hedge.glb, hedge-large.glb | 1.0 |
| decor fences | fence.glb | 1.0 |

### Step 4: Rewrite src/rendering/MeshFactory.ts

**Async swap pattern:**

```typescript
createUnitMesh(faction: Faction, unitId: string): THREE.Object3D {
  const wrapper = new THREE.Group();
  wrapper.name = `unit-${unitId}-wrapper`;

  // Placeholder box (visible ~100-300ms while GLB loads from cache)
  const color = faction === Faction.Human ? 0x3366bb : 0x44882a;
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.5, 0.3),
    new THREE.MeshStandardMaterial({ color })
  );
  box.position.y = 0.25;
  box.castShadow = true;
  wrapper.add(box);

  // Fire-and-forget async load
  this._modelLoader.loadCharacter(unitId, faction).then(model => {
    if (!wrapper.parent || wrapper.userData['disposed']) return; // guard destroyed entities
    wrapper.clear();
    wrapper.add(model);
  }).catch(err => {
    console.warn(`Failed to load model for ${unitId}:`, err);
    // Placeholder stays — game still playable
  });

  return wrapper;
}
```

Same pattern for `createBuildingMesh()`.

**Critical: disposed flag.** Set `wrapper.userData['disposed'] = true` in SceneManager.removeObject() to prevent stale async swaps on destroyed entities.

**Remove:** `_createCharacterSprite()` and `_createBuildingSprite()` — no longer called.

### Step 5: Update src/GameSetup.ts

Replace procedural tree in `spawnResourceNode()` with async-loaded `tree.glb`. Gold mine octahedron stays.

### Step 6: Update src/map/DecorScatter.ts

Replace procedural geometry with GLB props loaded via ModelLoader.

### Step 7: Add Loading Screen

Show "Loading..." with progress while `ModelLoader.preloadCommon()` runs during init. Game starts only after common models are cached. Player never sees placeholder boxes.

### Step 8: Wire Into src/main.ts

```typescript
const modelLoader = new ModelLoader();
await modelLoader.preloadCommon(); // loading screen during this
const meshFactory = new MeshFactory(modelLoader);
```

### Step 9: Construction Scale-Up Animation

In ConstructionSystem: buildings start at 10% scale, grow to 100% over construction time. ~3 lines of code.

### Step 10: Unit Bob + Rotate

In MovementSystem: moving units bob up/down (sine wave, 0.1 amplitude, ~3Hz) and rotate to face movement direction. ~10 lines. Makes static models feel alive.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/rendering/ModelLoader.ts` | GLB loader, cache, recipes, character mappings, faction tinting |
| `DESIGN.md` | Visual system documentation |

## Files to Modify

| File | Changes |
|---|---|
| `src/rendering/MeshFactory.ts` | Async swap pattern, remove sprite path, accept ModelLoader in constructor |
| `src/GameSetup.ts` | Tree resource nodes use GLB |
| `src/map/DecorScatter.ts` | GLB props instead of procedural geometry |
| `src/main.ts` | Instantiate ModelLoader, preload, loading screen, pass to MeshFactory |
| `src/rendering/SceneManager.ts` | Set disposed flag on removeObject() |
| `src/units/MovementSystem.ts` | Add bob + rotate for moving units |
| `src/buildings/ConstructionSystem.ts` | Scale-up during construction |
| `tests/unit/rendering/MeshFactory.test.ts` | Update for removed sprite path |

## Files NOT Modified

| File | Why |
|---|---|
| `src/units/UnitFactory.ts` | Calls MeshFactory.createUnitMesh() which stays sync |
| `src/buildings/BuildingFactory.ts` | Same reason |
| `src/art/ArtLibrary.ts` | Keep for portraits/icons, not used for 3D rendering |
| `src/ui/*` | Already done (amber colors, wood frames) |

## Existing Code to Reuse

- `MeshFactory._enableShadows()` — traverse + set castShadow/receiveShadow
- `factionColors()` at MeshFactory.ts:38 — for placeholder coloring
- `SceneManager.addObject()` — works with any THREE.Object3D, no changes

---

## Review Decisions (from office-hours + eng-review + design-review)

| Decision | Source | Details |
|---|---|---|
| Full recipe system (Approach A) | office-hours | All 9 building types get composed recipes, not single models |
| Parameterized recipes | eng-review | 9 recipes with faction parameter, not 18 separate entries |
| Disposed flag on wrapper | eng-review | Prevent async swap on destroyed entities |
| Preload common GLBs | eng-review | Promise.all ~15 unique GLBs during init for instant spawning |
| Full test coverage | eng-review | 12+ tests for ModelLoader + MeshFactory rewrite |
| Loading screen | design-review | Show loading during preload, player never sees placeholders |
| DESIGN.md creation | design-review | Document visual system to prevent future regressions |
| Construction scale-up | design-review | Buildings grow from 10% to 100% during construction |
| Unit bob + rotate | design-review | Moving units bob (sine Y) and face movement direction |

---

## Success Criteria

- All buildings render as composed Kenney 3D models
- All characters render as Kenney mini-character 3D models (except catapult)
- Trees are tree.glb, decor is GLB rocks/hedges/fences
- Shadows cast from all 3D models
- Loading screen prevents placeholder flash
- Units bob/rotate when moving
- Buildings scale up during construction
- `npx tsc --noEmit` passes
- `npx vitest run` passes (86+ tests, updated for new rendering)
- Visual QA: pan map, verify no floating parts, gaps, or wrong-scale entities

---

## Verification Commands

```bash
cd /Users/mohamed/Documents/game-startup/Claude-Code-Game-Studios/projects/minds-of-war
npx tsc --noEmit          # type check
npx vitest run            # run tests
npm run dev               # start dev server, check localhost:3000
```
