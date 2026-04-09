import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const PROJECT_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const STATUS_PATH = resolve(PROJECT_ROOT, 'art-pipeline-status.json');

describe('Art pipeline status', () => {
  it('records validated runtime prerequisites before final art phase completion', () => {
    const status = JSON.parse(readFileSync(STATUS_PATH, 'utf8')) as {
      validatedRuntimePipeline: {
        completed: boolean;
        prerequisites: Record<string, boolean>;
      };
      artPhase5: {
        status: string;
        supersedes: string;
      };
    };

    expect(status.validatedRuntimePipeline.completed).toBe(true);
    expect(status.validatedRuntimePipeline.prerequisites).toEqual({
      phase1_sprite_pipeline: true,
      phase2_terrain_texturing: true,
      phase3_ui_redesign: true,
      phase4_particle_vfx: true,
    });
    expect(status.artPhase5.status).toBe('completed');
    expect(status.artPhase5.supersedes).toBe('Phase 5: AI Art Generation');
  });

  it('allows the final art stage only when the validated pipeline gate passes', () => {
    const result = spawnSync('bash', ['tools/run_final_art.sh', '--check-prerequisites'], {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Validated runtime pipeline complete');
  });
});
