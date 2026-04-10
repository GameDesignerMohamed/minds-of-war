# TODOS — Minds of War

Last updated: 2026-04-09

---

## Kenney 3D Model Integration

**Goal:** Replace all placeholder sprites and procedural geometry with real Kenney 3D GLB models. Every entity uses Kenney models. Clean ground. Real shadows. Warm UI colors (already done). The reference is Nicolas Zullo's Vibejam (same Kenney assets + Three.js).

**Assets available:**
- `Art/kenney_fantasy-town-kit_2.0/Models/GLB format/` — 167 building/prop GLB files + colormap.png
- `Art/kenney_mini-characters/Models/GLB format/` — 12 character GLB files + colormap.png

---

### Step 1: Copy GLB Assets to public/

Copy GLB files from `Art/` to `public/models/` so Vite can serve them at runtime.

```
public/models/buildings/  ← from Art/kenney_fantasy-town-kit_2.0/Models/GLB format/
public/models/characters/ ← from Art/kenney_mini-characters/Models/GLB format/
```

Include `Textures/colormap.png` in each directory (GLBs reference it relatively).

---

### Step 2: Create ModelLoader.ts

**File:** `src/rendering/ModelLoader.ts` (new)

Single-purpose async GLB loader with caching.

**Key design:**
- Uses `GLTFLoader` from `three/examples/jsm/loaders/GLTFLoader.js`
- `loadModel(path): Promise<THREE.Group>` — loads GLB, caches original, returns clone
- Traverse loaded meshes: `castShadow = true`, `receiveShadow = true`, `colorSpace = SRGBColorSpace` on textures
- Cache by path — first load stores original, subsequent calls return `clone(true)`

**Building recipes** — compose multiple GLB parts into game buildings:

| Game Building | GLB Parts | Scale |
|---|---|---|
| keep | wall x4 + roof-high-point + banner-green | 2.0 |
| stronghold | wall-wood x4 + roof-high-point + banner-red | 2.0 |
| barracks / war_camp | wall x2 + wall-door + roof | 1.5 |
| farm / war_hut | fence x4 + stall | 1.2 |
| watch_tower / watch_post | wall (stacked x2) + roof-point | 1.8 |
| blacksmith / war_forge | wall x3 + chimney + roof | 1.3 |
| sanctum / spirit_lodge | wall-arch x2 + roof-high-point | 1.3 |
| workshop / siege_pit | wall-wood x3 + roof + wheel | 1.3 |
| archery_range / beast_den | fence x3 + stall + poles | 1.3 |

**Character mapping:**

| Game Unit | GLB Model | Scale |
|---|---|---|
| peasant / thrall | character-male-a.glb | 1.0 |
| footman / grunt | character-male-b.glb | 1.0 |
| archer / hunter | character-male-c.glb | 1.0 |
| knight / berserker | character-male-d.glb | 1.0 |
| cleric / shaman | character-female-a.glb | 1.0 |
| captain / warlord | character-male-e.glb | 1.0 |
| catapult / war_catapult | (keep procedural — distinctive silhouette) | — |

**Resource/prop mapping:**

| Entity | GLB Model | Scale |
|---|---|---|
| wood (tree) | tree.glb | 2.0 |
| gold mine | (keep procedural octahedron — distinctive) | — |
| decor rocks | rock-small.glb, rock-large.glb, rock-wide.glb | 1.0 |
| decor hedges | hedge.glb, hedge-large.glb | 1.0 |
| decor fences | fence.glb | 1.0 |

---

### Step 3: Rewrite MeshFactory for Async Model Swap

**File:** `src/rendering/MeshFactory.ts`

**Pattern:** `createUnitMesh()` and `createBuildingMesh()` stay synchronous. They return a wrapper `THREE.Group` with a small colored box placeholder. Fire-and-forget async loads the real model and swaps it in.

```typescript
createUnitMesh(faction, unitId): THREE.Object3D {
  const wrapper = new THREE.Group();
  // Tiny colored box placeholder (visible ~100ms while GLB loads)
  const placeholder = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.5, 0.3),
    new THREE.MeshStandardMaterial({ color: factionColor })
  );
  placeholder.position.y = 0.25;
  wrapper.add(placeholder);

  // Fire async load — swap when ready
  modelLoader.loadCharacter(unitId, faction).then(model => {
    wrapper.clear();
    wrapper.add(model);
  });

  return wrapper;
}
```

Same pattern for `createBuildingMesh()`.

**Remove:** `_createCharacterSprite()` and `_createBuildingSprite()` — no longer needed.

---

### Step 4: GLB Trees for Resource Nodes

**File:** `src/GameSetup.ts`

Replace procedural cone+cylinder tree in `spawnResourceNode()` with async-loaded `tree.glb`. Gold mines keep the procedural octahedron.

---

### Step 5: GLB Props for Decor

**File:** `src/map/DecorScatter.ts`

Replace procedural rocks/bushes with Kenney GLB props:
- `rock-small.glb`, `rock-large.glb`, `rock-wide.glb` for scattered rocks
- `hedge.glb`, `hedge-large.glb` for map edge bushes
- `fence.glb` near starting positions

---

### Step 6: Wire Into main.ts

Instantiate `ModelLoader`, pass to `MeshFactory` constructor. Optionally trigger preload of common models during init.

**Verify:**
- `npx tsc --noEmit` — no type errors
- `npx vitest run` — all tests pass
- Visual: buildings are Kenney 3D models, characters are Kenney mini-characters, trees are GLB, shadows work

---

## Already Completed (this session)

- [x] Shadows enabled (renderer.shadowMap + PCFSoft + shadow camera covers 96x96 map)
- [x] Clean ground plane (terrain tiles removed, flat green MeshStandardMaterial)
- [x] UI colors harmonized (all cyan → amber/gold, 33 references across 9 files)
- [x] Selection ring color (amber, both UnitFactory and BuildingFactory)
- [x] Camera tilt (offset 0,40,18 for slight isometric view)
- [x] Camera zoom (baseViewWidth 35, was 70)
- [x] Character sprite scales bumped 1.5x
- [x] Decor scatter (procedural rocks + bushes — will be replaced with GLB in Step 5)
- [x] Scene background darkened to match map edge
- [x] Ambient light cooled to 0xb0c4de
- [x] Directional light target centered on map (48,0,48)
- [x] Donchitos remote removed, standalone repo created at GameDesignerMohamed/minds-of-war
