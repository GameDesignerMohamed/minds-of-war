/**
 * SelectionPanel — sidebar panel displaying details of selected entities.
 *
 * Renders a portrait grid when multiple entities are selected, and a detailed
 * single-entity view with portrait, health, and stat cards when exactly one
 * entity is selected.
 */

import { World } from '@/ecs/World';
import { applyUiFrameStyles, getPortraitPath } from '@/art/ArtLibrary';
import type { EntityId } from '@/types';
import {
  HealthType,
  UnitType,
  BuildingType,
  FactionType,
  WorkerType,
  DisplayStatsType,
} from '@/ecs/components/GameComponents';
import type {
  HealthComponent,
  UnitComponent,
  BuildingComponent,
  DisplayStatsComponent,
} from '@/ecs/components/GameComponents';

const MAX_PORTRAITS = 12;

export class SelectionPanel {
  private readonly _world: World;

  private _root: HTMLElement | null = null;
  private _singleView: HTMLElement | null = null;
  private _multiView: HTMLElement | null = null;
  private _emptyView: HTMLElement | null = null;

  private _singlePortrait: HTMLElement | null = null;
  private _singleName: HTMLElement | null = null;
  private _singleMeta: HTMLElement | null = null;
  private _singleHpBar: HTMLElement | null = null;
  private _singleHpLabel: HTMLElement | null = null;
  private _singleStats: HTMLElement | null = null;

  private _portraitGrid: HTMLElement | null = null;

  constructor(world: World) {
    this._world = world;
  }

  mount(parent: HTMLElement): void {
    if (this._root !== null) return;
    this._root = this._buildRoot();
    this._buildEmptyView();
    this._buildSingleView();
    this._buildMultiView();
    parent.appendChild(this._root);
    this._showView('empty');
  }

  destroy(): void {
    this._root?.remove();
    this._root = null;
  }

  refresh(selected: ReadonlySet<EntityId>): void {
    if (this._root === null) return;

    if (selected.size === 0) {
      this._showView('empty');
    } else if (selected.size === 1) {
      const [entity] = selected;
      this._updateSingleView(entity!);
      this._showView('single');
    } else {
      this._updateMultiView(selected);
      this._showView('multi');
    }
  }

  private _buildRoot(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'selection-panel';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Unit selection details');
    Object.assign(el.style, {
      width: '100%',
      height: '100%',
      padding: '14px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      pointerEvents: 'auto',
      fontFamily: "'Space Mono', monospace",
    } satisfies Partial<CSSStyleDeclaration>);
    return el;
  }

  private _buildEmptyView(): void {
    const el = document.createElement('div');
    el.id = 'sp-empty';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = 'Select a unit or structure';
    Object.assign(el.style, {
      margin: 'auto 0',
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '500',
      fontSize: '0.82rem',
      color: 'rgba(255,255,255,0.28)',
      textAlign: 'center',
    } satisfies Partial<CSSStyleDeclaration>);
    this._emptyView = el;
    this._root!.appendChild(el);
  }

  private _buildSingleView(): void {
    const el = document.createElement('div');
    el.id = 'sp-single';
    Object.assign(el.style, {
      display: 'none',
      flexDirection: 'column',
      gap: '14px',
      height: '100%',
    } satisfies Partial<CSSStyleDeclaration>);

    const top = document.createElement('div');
    Object.assign(top.style, {
      display: 'grid',
      gridTemplateColumns: '104px minmax(0, 1fr)',
      gap: '14px',
      alignItems: 'start',
    } satisfies Partial<CSSStyleDeclaration>);

    this._singlePortrait = document.createElement('div');
    Object.assign(this._singlePortrait.style, {
      position: 'relative',
      width: '104px',
      aspectRatio: '1 / 1',
      borderRadius: '6px',
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.03)',
    } satisfies Partial<CSSStyleDeclaration>);
    applyUiFrameStyles(this._singlePortrait, 'portrait', 6, 'rgba(12,18,22,0.94)');

    const details = document.createElement('div');
    Object.assign(details.style, {
      minWidth: '0',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    } satisfies Partial<CSSStyleDeclaration>);

    this._singleName = document.createElement('h3');
    Object.assign(this._singleName.style, {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '600',
      fontSize: '1.05rem',
      color: '#ffffff',
      margin: '0',
      lineHeight: '1.2',
    } satisfies Partial<CSSStyleDeclaration>);

    this._singleMeta = document.createElement('div');
    Object.assign(this._singleMeta.style, {
      fontSize: '0.68rem',
      color: 'rgba(255,255,255,0.58)',
      minHeight: '1.2em',
    } satisfies Partial<CSSStyleDeclaration>);

    const hpRow = document.createElement('div');
    Object.assign(hpRow.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    } satisfies Partial<CSSStyleDeclaration>);

    const hpTrack = document.createElement('div');
    Object.assign(hpTrack.style, {
      flex: '1',
      height: '6px',
      background: 'rgba(255,255,255,0.10)',
      borderRadius: '3px',
      overflow: 'hidden',
    } satisfies Partial<CSSStyleDeclaration>);

    this._singleHpBar = document.createElement('div');
    this._singleHpBar.setAttribute('role', 'progressbar');
    this._singleHpBar.setAttribute('aria-valuemin', '0');
    this._singleHpBar.setAttribute('aria-valuenow', '0');
    this._singleHpBar.setAttribute('aria-valuemax', '100');
    this._singleHpBar.setAttribute('aria-label', 'Health');
    Object.assign(this._singleHpBar.style, {
      height: '100%',
      width: '100%',
      background: '#3df2c0',
      borderRadius: '3px',
      transformOrigin: 'left',
      transition: 'transform 0.15s ease, background-color 0.15s ease',
    } satisfies Partial<CSSStyleDeclaration>);
    hpTrack.appendChild(this._singleHpBar);

    this._singleHpLabel = document.createElement('span');
    Object.assign(this._singleHpLabel.style, {
      fontFamily: "'Space Mono', monospace",
      fontSize: '0.75rem',
      color: '#3df2c0',
      whiteSpace: 'nowrap',
      minWidth: '64px',
      textAlign: 'right',
    } satisfies Partial<CSSStyleDeclaration>);

    hpRow.appendChild(hpTrack);
    hpRow.appendChild(this._singleHpLabel);

    this._singleStats = document.createElement('div');
    Object.assign(this._singleStats.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '8px',
    } satisfies Partial<CSSStyleDeclaration>);

    details.appendChild(this._singleName);
    details.appendChild(this._singleMeta);
    details.appendChild(hpRow);
    top.appendChild(this._singlePortrait);
    top.appendChild(details);

    el.appendChild(top);
    el.appendChild(this._singleStats);

    this._singleView = el;
    this._root!.appendChild(el);
  }

  private _buildMultiView(): void {
    const el = document.createElement('div');
    el.id = 'sp-multi';
    Object.assign(el.style, {
      display: 'none',
      flexDirection: 'column',
      gap: '10px',
    } satisfies Partial<CSSStyleDeclaration>);

    const header = document.createElement('div');
    header.textContent = 'Selection';
    Object.assign(header.style, {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '600',
      fontSize: '0.8rem',
      color: 'rgba(255,255,255,0.72)',
    } satisfies Partial<CSSStyleDeclaration>);

    this._portraitGrid = document.createElement('div');
    Object.assign(this._portraitGrid.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '8px',
    } satisfies Partial<CSSStyleDeclaration>);

    el.appendChild(header);
    el.appendChild(this._portraitGrid);
    this._multiView = el;
    this._root!.appendChild(el);
  }

  private _showView(view: 'empty' | 'single' | 'multi'): void {
    if (this._emptyView) this._emptyView.style.display = view === 'empty' ? 'block' : 'none';
    if (this._singleView) this._singleView.style.display = view === 'single' ? 'flex' : 'none';
    if (this._multiView) this._multiView.style.display = view === 'multi' ? 'flex' : 'none';
  }

  private _updateSingleView(entity: EntityId): void {
    const hp = this._world.getComponent<HealthComponent>(entity, HealthType);
    const unitComp = this._world.getComponent<UnitComponent>(entity, UnitType);
    const buildComp = this._world.getComponent<BuildingComponent>(entity, BuildingType);
    const displayStats = this._world.getComponent<DisplayStatsComponent>(entity, DisplayStatsType);
    const factionComp = this._world.getComponent(entity, FactionType);
    const name = unitComp?.displayName ?? buildComp?.displayName ?? 'Unknown';
    const portraitPath = getPortraitPath(unitComp?.unitId ?? buildComp?.buildingId ?? '');

    if (this._singleName !== null) {
      this._singleName.textContent = name;
    }

    if (this._singleMeta !== null) {
      const meta: string[] = [];
      if (buildComp !== undefined) {
        meta.push('Building');
        meta.push(buildComp.isComplete ? 'Complete' : 'Under Construction');
      } else if (unitComp !== undefined) {
        meta.push(unitComp.isWorker ? 'Worker' : 'Unit');
        meta.push(`Tier ${unitComp.tier}`);
      }
      this._singleMeta.textContent = meta.join(' • ');
    }

    if (this._singlePortrait !== null) {
      this._singlePortrait.innerHTML = '';
      this._singlePortrait.appendChild(this._buildPortraitArt(name, portraitPath));
    }

    if (hp !== undefined && this._singleHpBar !== null && this._singleHpLabel !== null) {
      const pct = hp.max > 0 ? Math.max(0, Math.min(1, hp.current / hp.max)) : 0;
      this._singleHpBar.style.transform = `scaleX(${pct})`;
      this._singleHpBar.style.backgroundColor = pct < 0.3 ? '#f2913d' : '#3df2c0';
      this._singleHpBar.setAttribute('aria-valuenow', String(Math.round(hp.current)));
      this._singleHpBar.setAttribute('aria-valuemax', String(hp.max));
      this._singleHpLabel.textContent = `${Math.round(hp.current)} / ${hp.max}`;
    }

    if (this._singleStats !== null) {
      this._singleStats.innerHTML = '';

      const role = this._world.hasComponent(entity, WorkerType)
        ? 'Worker'
        : buildComp !== undefined
          ? 'Structure'
          : 'Combatant';

      const rows = [
        ['Faction', factionComp?.faction ?? 'Neutral'],
        ['Role', role],
        ['Armor', this._formatStat(displayStats?.armor)],
        ['Damage', this._formatStat(displayStats?.damage)],
        ['Range', this._formatStat(displayStats?.range)],
        ['Sight', this._formatStat(displayStats?.sight)],
        ['Speed', this._formatStat(displayStats?.speed)],
        ['Status', buildComp !== undefined && !buildComp.isComplete ? 'Building...' : 'Ready'],
      ] as const;

      for (const [label, value] of rows) {
        this._singleStats.appendChild(this._statChip(label, value));
      }
    }
  }

  private _updateMultiView(selected: ReadonlySet<EntityId>): void {
    if (this._portraitGrid === null) return;
    this._portraitGrid.innerHTML = '';

    let count = 0;
    for (const entity of selected) {
      if (count >= MAX_PORTRAITS) break;
      this._portraitGrid.appendChild(this._buildPortrait(entity));
      count++;
    }

    if (selected.size > MAX_PORTRAITS) {
      const badge = document.createElement('div');
      badge.textContent = `+${selected.size - MAX_PORTRAITS}`;
      Object.assign(badge.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif",
        fontWeight: '700',
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.5)',
        background: 'rgba(61,242,192,0.08)',
        border: '1px solid rgba(61,242,192,0.15)',
        borderRadius: '4px',
        aspectRatio: '1 / 1',
      } satisfies Partial<CSSStyleDeclaration>);
      this._portraitGrid.appendChild(badge);
    }
  }

  private _buildPortrait(entity: EntityId): HTMLElement {
    const hp = this._world.getComponent<HealthComponent>(entity, HealthType);
    const unitComp = this._world.getComponent<UnitComponent>(entity, UnitType);
    const buildComp = this._world.getComponent<BuildingComponent>(entity, BuildingType);
    const name = unitComp?.displayName ?? buildComp?.displayName ?? 'Unit';
    const hpPct = hp && hp.max > 0 ? Math.max(0, Math.min(1, hp.current / hp.max)) : 1;
    const portraitPath = getPortraitPath(unitComp?.unitId ?? buildComp?.buildingId ?? '');

    const wrap = document.createElement('div');
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', `${name}, HP ${Math.round(hpPct * 100)}%`);
    Object.assign(wrap.style, {
      position: 'relative',
      borderRadius: '4px',
      aspectRatio: '1 / 1',
      overflow: 'hidden',
      cursor: 'default',
    } satisfies Partial<CSSStyleDeclaration>);
    applyUiFrameStyles(wrap, 'portrait', 4, 'rgba(12,18,22,0.94)');

    wrap.appendChild(this._buildPortraitArt(name, portraitPath));

    const hpBar = document.createElement('div');
    Object.assign(hpBar.style, {
      position: 'absolute',
      bottom: '0',
      left: '0',
      height: '3px',
      width: `${Math.round(hpPct * 100)}%`,
      background: hpPct < 0.3 ? '#f2913d' : '#3df2c0',
      transition: 'width 0.15s ease, background-color 0.15s ease',
    } satisfies Partial<CSSStyleDeclaration>);
    wrap.appendChild(hpBar);

    return wrap;
  }

  private _buildPortraitArt(name: string, portraitPath: string | null): HTMLElement {
    if (portraitPath !== null) {
      const portrait = document.createElement('img');
      portrait.src = portraitPath;
      portrait.alt = '';
      portrait.setAttribute('aria-hidden', 'true');
      Object.assign(portrait.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        imageRendering: 'pixelated',
      } satisfies Partial<CSSStyleDeclaration>);
      return portrait;
    }

    const initial = document.createElement('span');
    initial.textContent = name.charAt(0).toUpperCase();
    initial.setAttribute('aria-hidden', 'true');
    Object.assign(initial.style, {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '700',
      fontSize: '1.1rem',
      color: '#3df2c0',
    } satisfies Partial<CSSStyleDeclaration>);
    return initial;
  }

  private _statChip(label: string, value: string): HTMLElement {
    const chip = document.createElement('div');
    Object.assign(chip.style, {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '8px 10px',
      borderRadius: '4px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(61,242,192,0.10)',
      fontSize: '0.72rem',
      color: '#ffffff',
    } satisfies Partial<CSSStyleDeclaration>);

    const labelEl = document.createElement('span');
    labelEl.textContent = label.toUpperCase();
    Object.assign(labelEl.style, {
      opacity: '0.55',
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '600',
    } satisfies Partial<CSSStyleDeclaration>);

    const valueEl = document.createElement('span');
    valueEl.textContent = value;
    Object.assign(valueEl.style, {
      color: '#3df2c0',
      textAlign: 'right',
    } satisfies Partial<CSSStyleDeclaration>);

    chip.appendChild(labelEl);
    chip.appendChild(valueEl);
    return chip;
  }

  private _formatStat(value: number | undefined): string {
    if (typeof value !== 'number') return '--';
    const rounded = Number(value.toFixed(1));
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }
}
