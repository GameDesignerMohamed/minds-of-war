#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import random
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError as exc:  # pragma: no cover - tool bootstrap
    raise SystemExit(
        "Pillow is required to regenerate final art assets.\n"
        "Install it with: python3 -m pip install pillow\n"
        f"Import error: {exc}"
    ) from exc


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "public"
SRC_DIR = ROOT / "src"
DATA_DIR = ROOT / "assets" / "data"
MANIFEST_PATH = SRC_DIR / "art" / "artManifest.json"
TERRAIN_ATLAS_PATH = PUBLIC_DIR / "textures" / "terrain" / "terrain-atlas.png"
PIPELINE_STATUS_PATH = ROOT / "art-pipeline-status.json"

FRAME_SIZE = 64
DIRECTION_ORDER = [
    "south",
    "south_east",
    "east",
    "north_east",
    "north",
    "north_west",
    "west",
    "south_west",
]
STATE_FRAMES = {
    "idle": 4,
    "walk": 6,
    "attack": 6,
    "hurt": 3,
    "death": 6,
}


@dataclass(frozen=True)
class FactionPalette:
    primary: tuple[int, int, int]
    secondary: tuple[int, int, int]
    accent: tuple[int, int, int]
    cloth: tuple[int, int, int]


HUMAN = FactionPalette(
    primary=(59, 108, 191),
    secondary=(114, 148, 207),
    accent=(214, 175, 81),
    cloth=(29, 47, 87),
)
ORC = FactionPalette(
    primary=(139, 62, 48),
    secondary=(94, 123, 57),
    accent=(230, 109, 57),
    cloth=(64, 39, 28),
)

UNIT_ROLES = {
    "peasant": "worker",
    "thrall": "worker",
    "footman": "melee",
    "grunt": "melee",
    "archer": "ranged",
    "hunter": "ranged",
    "knight": "mounted",
    "berserker": "mounted",
    "cleric": "caster",
    "shaman": "caster",
    "catapult": "siege",
    "war_catapult": "siege",
    "captain": "hero",
    "warlord": "hero",
}

BUILDING_ROLES = {
    "keep": "hq",
    "stronghold": "hq",
    "farm": "farm",
    "war_hut": "farm",
    "barracks": "barracks",
    "war_camp": "barracks",
    "archery_range": "range",
    "beast_den": "range",
    "sanctum": "temple",
    "spirit_lodge": "temple",
    "blacksmith": "smith",
    "war_forge": "smith",
    "workshop": "workshop",
    "siege_pit": "workshop",
    "watch_tower": "tower",
    "watch_post": "tower",
}

CHARACTER_WORLD_SCALE = {
    "worker": {"x": 1.4, "y": 1.7},
    "melee": {"x": 1.6, "y": 1.9},
    "ranged": {"x": 1.55, "y": 1.85},
    "mounted": {"x": 2.4, "y": 2.55},
    "caster": {"x": 1.6, "y": 2.0},
    "siege": {"x": 2.8, "y": 2.1},
    "hero": {"x": 1.8, "y": 2.15},
}

BUILDING_WORLD_SCALE = {
    "hq": {"x": 5.2, "y": 4.8},
    "farm": {"x": 3.0, "y": 2.7},
    "barracks": {"x": 4.2, "y": 3.7},
    "range": {"x": 4.0, "y": 3.5},
    "temple": {"x": 4.0, "y": 3.9},
    "smith": {"x": 3.8, "y": 3.4},
    "workshop": {"x": 4.3, "y": 3.8},
    "tower": {"x": 2.7, "y": 4.5},
}

REQUIRED_PIPELINE_PHASES = (
    ("phase1_sprite_pipeline", "Phase 1 Sprite Pipeline"),
    ("phase2_terrain_texturing", "Phase 2 Terrain Texturing"),
    ("phase3_ui_redesign", "Phase 3 UI Redesign"),
    ("phase4_particle_vfx", "Phase 4 Particle VFX"),
)


def rgba(color: tuple[int, int, int], alpha: int = 255) -> tuple[int, int, int, int]:
    return (color[0], color[1], color[2], alpha)


def clamp(value: float, min_value: int = 0, max_value: int = 255) -> int:
    return max(min_value, min(max_value, int(round(value))))


def lighten(color: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(clamp(channel + (255 - channel) * amount) for channel in color)


def darken(color: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(clamp(channel * (1 - amount)) for channel in color)


def outlined(draw: ImageDraw.ImageDraw, shape: str, coords: Iterable[int], fill, outline, width: int = 1) -> None:
    fn = getattr(draw, shape)
    fn(coords, fill=fill, outline=outline, width=width)


def line_brush(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], fill, width: int) -> None:
    draw.line(points, fill=fill, width=width, joint="curve")


def gradient_orb(size: int, inner, outer, spokes: int = 0) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = img.load()
    center = (size - 1) / 2
    radius = size * 0.48
    for y in range(size):
        for x in range(size):
            dx = x - center
            dy = y - center
            distance = math.sqrt(dx * dx + dy * dy)
            if distance > radius:
                continue
            t = distance / radius
            alpha = clamp((1 - t**1.55) * 255)
            mix = 1 - min(1.0, t)
            px[x, y] = (
                clamp(outer[0] * t + inner[0] * mix),
                clamp(outer[1] * t + inner[1] * mix),
                clamp(outer[2] * t + inner[2] * mix),
                alpha,
            )

    if spokes > 0:
        draw = ImageDraw.Draw(img)
        for index in range(spokes):
            angle = (math.tau / spokes) * index
            start = (center, center)
            end = (
                center + math.cos(angle) * radius * 0.9,
                center + math.sin(angle) * radius * 0.9,
            )
            draw.line((start, end), fill=rgba(lighten(inner, 0.35), 150), width=max(1, size // 18))
    return img


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def load_pipeline_status() -> dict:
    if not PIPELINE_STATUS_PATH.exists():
        raise SystemExit(
            f"Missing pipeline status marker: {PIPELINE_STATUS_PATH}\n"
            "Final art generation is gated until the validated runtime pipeline is recorded."
        )

    return json.loads(PIPELINE_STATUS_PATH.read_text())


def validate_pipeline_status(status: dict) -> None:
    pipeline = status.get("validatedRuntimePipeline")
    if not isinstance(pipeline, dict) or pipeline.get("completed") is not True:
        raise SystemExit(
            "Validated runtime pipeline is not marked complete.\n"
            "Final art generation runs only after Phases 1-4 are complete."
        )

    prerequisites = pipeline.get("prerequisites")
    if not isinstance(prerequisites, dict):
        raise SystemExit("Pipeline status marker is missing prerequisite phase data.")

    missing = [label for key, label in REQUIRED_PIPELINE_PHASES if prerequisites.get(key) is not True]
    if missing:
        raise SystemExit(
            "Validated runtime pipeline is incomplete.\n"
            f"Missing prerequisite phases: {', '.join(missing)}"
        )


def verify_runtime_contract() -> None:
    result = subprocess.run(
        ["npm", "test", "--", "tests/unit/art/ArtManifest.test.ts"],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise SystemExit(
            "Runtime art contract validation failed.\n"
            f"{result.stdout}{result.stderr}"
        )


def ensure_prerequisites() -> dict:
    status = load_pipeline_status()
    validate_pipeline_status(status)
    verify_runtime_contract()
    return status


def faction_palette(faction: str) -> FactionPalette:
    return HUMAN if faction == "human" else ORC


def faction_skin(faction: str) -> tuple[int, int, int]:
    return (224, 190, 146) if faction == "human" else (126, 168, 92)


def facing_profile(direction_index: int) -> tuple[int, float]:
    profiles = [
        (0, 1.0),
        (1, 0.8),
        (1, 0.45),
        (1, -0.1),
        (0, -0.6),
        (-1, -0.1),
        (-1, 0.45),
        (-1, 0.8),
    ]
    return profiles[direction_index]


def role_icon_colors(kind: str) -> tuple[tuple[int, int, int], tuple[int, int, int]]:
    bg = {
        "command": (33, 41, 56),
        "resource": (52, 49, 40),
        "ability": (39, 27, 48),
    }[kind]
    accent = {
        "command": (74, 208, 188),
        "resource": (224, 193, 98),
        "ability": (203, 112, 231),
    }[kind]
    return bg, accent


def render_unit_frame(unit_id: str, faction: str, state: str, frame: int, direction_index: int) -> Image.Image:
    role = UNIT_ROLES[unit_id]
    palette = faction_palette(faction)
    skin = faction_skin(faction)
    img = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    side, front = facing_profile(direction_index)
    frame_count = STATE_FRAMES[state]
    phase = frame / frame_count
    bob = round(math.sin(phase * math.tau) * (1.3 if state in {"idle", "walk"} else 0.3))
    stride = math.sin(phase * math.tau) if state == "walk" else 0.0
    lunge = math.sin(phase * math.pi) if state == "attack" else 0.0
    recoil = math.sin(phase * math.pi) if state == "hurt" else 0.0
    collapse = phase if state == "death" else 0.0
    center_x = 32 + side * 2 + round(lunge * side * 4) - round(recoil * side * 3)
    foot_y = 54 + bob + round(collapse * 6)
    back_view = front < 0
    primary = palette.primary
    secondary = palette.secondary
    accent = palette.accent
    outline = rgba(darken(primary, 0.55))
    if role == "worker":
        primary = lighten(primary, 0.12)
        accent = (141, 113, 72)
    elif role == "ranged":
        primary = lighten(secondary, 0.06)
    elif role == "caster":
        primary = lighten(palette.cloth, 0.18)
    elif role == "hero":
        accent = lighten(accent, 0.14)

    if role == "siege":
        render_siege(draw, unit_id, center_x, foot_y, phase, state, primary, secondary, accent, outline, side, collapse)
        return img
    if role == "mounted":
        render_mount(draw, faction, center_x, foot_y, bob, stride, lunge, recoil, collapse, primary, secondary, accent, outline, skin, side, back_view)
        return img

    leg_swing = round(stride * 4) if state == "walk" else 0
    if state == "attack":
        leg_swing = round(lunge * 2)
    torso_w = 16 if role in {"melee", "hero"} else 14
    torso_h = 18 if role != "worker" else 16
    if state == "death":
        draw.rounded_rectangle(
            (center_x - 12, foot_y - 7, center_x + 14, foot_y + 1),
            radius=3,
            fill=rgba(darken(primary, 0.18), clamp(255 - collapse * 30)),
            outline=rgba(darken(primary, 0.55), clamp(255 - collapse * 30)),
            width=1,
        )
        draw.ellipse((center_x - 16, foot_y - 10, center_x - 6, foot_y), fill=rgba(darken(skin, 0.08)))
        if role in {"melee", "hero"}:
            line_brush(draw, [(center_x + 4, foot_y - 8), (center_x + 16, foot_y + 4)], fill=rgba(lighten(accent, 0.25), 220), width=2)
        return img

    draw.rectangle((center_x - 5, foot_y - 10, center_x - 2, foot_y), fill=rgba(darken(palette.cloth, 0.05)))
    draw.rectangle((center_x + 2, foot_y - 10, center_x + 5, foot_y), fill=rgba(darken(palette.cloth, 0.05)))
    if state == "walk":
        draw.rectangle((center_x - 5 - leg_swing, foot_y - 10, center_x - 2 - leg_swing, foot_y), fill=rgba(darken(palette.cloth, 0.02)))
        draw.rectangle((center_x + 2 + leg_swing, foot_y - 10, center_x + 5 + leg_swing, foot_y), fill=rgba(darken(palette.cloth, 0.02)))
    torso_top = foot_y - 10 - torso_h
    torso_box = (center_x - torso_w // 2, torso_top, center_x + torso_w // 2, foot_y - 10)
    outlined(draw, "rounded_rectangle", torso_box, fill=rgba(primary), outline=outline, width=1)
    if role in {"melee", "hero"}:
        draw.rectangle((torso_box[0] + 1, torso_top + 2, torso_box[2] - 1, torso_top + 4), fill=rgba(accent))
    if role == "caster":
        draw.rectangle((torso_box[0] + 2, torso_top + 6, torso_box[2] - 2, torso_top + 8), fill=rgba(accent))
    head_y = torso_top - 9 + bob - round(recoil * 2)
    head_fill = rgba(darken(skin, 0.18) if back_view else skin)
    outlined(draw, "ellipse", (center_x - 6, head_y, center_x + 6, head_y + 10), fill=head_fill, outline=rgba(darken(skin, 0.45)), width=1)
    if role == "hero":
        draw.polygon([(center_x - 6, head_y + 2), (center_x, head_y - 3), (center_x + 6, head_y + 2), (center_x + 2, head_y + 1), (center_x, head_y - 1), (center_x - 2, head_y + 1)], fill=rgba(accent))
    arm_y = torso_top + 8
    draw.rectangle((center_x - torso_w // 2 - 3, arm_y - 1, center_x - torso_w // 2 + 1, arm_y + 6), fill=rgba(darken(primary, 0.08)))
    draw.rectangle((center_x + torso_w // 2 - 1, arm_y - 1, center_x + torso_w // 2 + 3, arm_y + 6), fill=rgba(darken(primary, 0.08)))
    render_weapon(draw, role, center_x, arm_y, side, lunge, recoil, palette, accent, state, front)
    return img


def render_mount(
    draw: ImageDraw.ImageDraw,
    faction: str,
    center_x: int,
    foot_y: int,
    bob: int,
    stride: float,
    lunge: float,
    recoil: float,
    collapse: float,
    primary,
    secondary,
    accent,
    outline,
    skin,
    side: int,
    back_view: bool,
) -> None:
    horse = (117, 85, 53) if faction == "human" else (87, 57, 45)
    horse_dark = darken(horse, 0.25)
    body_y = foot_y - 24 + bob
    draw.rounded_rectangle((center_x - 20, body_y, center_x + 18, body_y + 15), radius=4, fill=rgba(horse), outline=rgba(horse_dark), width=1)
    head_x = center_x + side * 18
    outlined(draw, "ellipse", (head_x - 7, body_y - 4, head_x + 7, body_y + 8), fill=rgba(horse), outline=rgba(horse_dark), width=1)
    for offset in (-12, -3, 6, 15):
        shift = round(stride * 3) if (offset // 3) % 2 == 0 else -round(stride * 3)
        draw.rectangle((center_x + offset + shift, body_y + 11, center_x + offset + shift + 3, foot_y + 1), fill=rgba(horse_dark))
    rider_y = body_y - 13 - round(recoil * 3)
    draw.rounded_rectangle((center_x - 8, rider_y, center_x + 8, rider_y + 15), radius=3, fill=rgba(primary), outline=outline, width=1)
    head_fill = rgba(darken(skin, 0.18) if back_view else skin)
    outlined(draw, "ellipse", (center_x - 6, rider_y - 9, center_x + 6, rider_y + 1), fill=head_fill, outline=rgba(darken(skin, 0.45)), width=1)
    lance_end = (center_x + side * 26, rider_y - 4 - round(lunge * 6))
    line_brush(draw, [(center_x + side * 6, rider_y + 4), lance_end], fill=rgba(lighten(accent, 0.25)), width=2)
    draw.polygon([(lance_end[0], lance_end[1]), (lance_end[0] + side * 5, lance_end[1] + 2), (lance_end[0], lance_end[1] + 4)], fill=rgba(lighten(accent, 0.4)))


def render_siege(
    draw: ImageDraw.ImageDraw,
    unit_id: str,
    center_x: int,
    foot_y: int,
    phase: float,
    state: str,
    primary,
    secondary,
    accent,
    outline,
    side: int,
    collapse: float,
) -> None:
    wood = (135, 91, 48) if unit_id == "catapult" else (103, 69, 43)
    arm_tilt = math.sin(phase * math.pi) * 12 if state == "attack" else 0
    alpha = clamp(255 - collapse * 24)
    draw.rounded_rectangle((center_x - 18, foot_y - 12, center_x + 18, foot_y), radius=4, fill=rgba(wood, alpha), outline=rgba(darken(wood, 0.35), alpha), width=1)
    draw.rectangle((center_x - 12, foot_y - 22, center_x - 9, foot_y - 6), fill=rgba(secondary, alpha))
    draw.rectangle((center_x + 9, foot_y - 22, center_x + 12, foot_y - 6), fill=rgba(secondary, alpha))
    for wheel_x in (center_x - 14, center_x + 14):
        outlined(draw, "ellipse", (wheel_x - 6, foot_y - 8, wheel_x + 6, foot_y + 4), fill=rgba(primary, alpha), outline=rgba(darken(primary, 0.45), alpha), width=1)
    line_brush(draw, [(center_x - 2, foot_y - 18), (center_x + 18 + side * 4, foot_y - 26 - round(arm_tilt))], fill=rgba(lighten(accent, 0.15), alpha), width=3)
    draw.ellipse((center_x + 15 + side * 4, foot_y - 31 - round(arm_tilt), center_x + 23 + side * 4, foot_y - 23 - round(arm_tilt)), fill=rgba(darken(primary, 0.1), alpha))


def render_weapon(
    draw: ImageDraw.ImageDraw,
    role: str,
    center_x: int,
    arm_y: int,
    side: int,
    lunge: float,
    recoil: float,
    palette: FactionPalette,
    accent,
    state: str,
    front: float,
) -> None:
    metal = lighten(accent, 0.35)
    wood = (131, 93, 53)
    reach = 10 + round(lunge * 10)
    if role == "worker":
        line_brush(draw, [(center_x + side * 3, arm_y + 2), (center_x + side * 11, arm_y - 4)], fill=rgba(wood), width=2)
        line_brush(draw, [(center_x + side * 9, arm_y - 6), (center_x + side * 14, arm_y - 10)], fill=rgba(metal), width=2)
        return
    if role in {"melee", "hero"}:
        line_brush(draw, [(center_x + side * 4, arm_y + 2), (center_x + side * reach, arm_y - 6)], fill=rgba(lighten(metal, 0.08)), width=2)
        if role == "melee":
            outlined(draw, "rounded_rectangle", (center_x - side * 16 - 5, arm_y - 3, center_x - side * 16 + 3, arm_y + 8), fill=rgba(palette.secondary), outline=rgba(darken(palette.secondary, 0.4)), width=1)
        return
    if role == "ranged":
        bow_x = center_x + side * 12
        draw.arc((bow_x - 6, arm_y - 9, bow_x + 6, arm_y + 11), start=270 if side > 0 else 90, end=90 if side > 0 else 270, fill=rgba(wood), width=2)
        draw.line((bow_x, arm_y - 8, bow_x, arm_y + 10), fill=rgba(lighten(metal, 0.15)), width=1)
        if state == "attack":
            line_brush(draw, [(center_x + side * 4, arm_y + 2), (center_x + side * 24, arm_y - 8)], fill=rgba(lighten(metal, 0.25)), width=1)
        return
    if role == "caster":
        line_brush(draw, [(center_x + side * 5, arm_y + 2), (center_x + side * 12, arm_y - 10)], fill=rgba(wood), width=2)
        draw.ellipse((center_x + side * 8 - 4, arm_y - 17, center_x + side * 8 + 4, arm_y - 9), fill=rgba(lighten(accent, 0.25), 220))
        return


def render_building_sprite(building_id: str, faction: str) -> Image.Image:
    role = BUILDING_ROLES[building_id]
    palette = faction_palette(faction)
    img = Image.new("RGBA", (192, 192), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    primary = palette.primary
    secondary = palette.secondary
    accent = palette.accent
    wood = (137, 91, 54) if faction == "human" else (103, 68, 41)
    stone = lighten(primary, 0.16) if faction == "human" else darken(primary, 0.04)

    def roof(points, color):
        draw.polygon(points, fill=rgba(color), outline=rgba(darken(color, 0.4)))

    if role == "hq":
        draw.rounded_rectangle((32, 90, 160, 160), radius=8, fill=rgba(stone), outline=rgba(darken(stone, 0.4)), width=2)
        draw.rectangle((92, 48, 140, 112), fill=rgba(secondary), outline=rgba(darken(secondary, 0.35)), width=2)
        roof([(24, 92), (96, 48), (168, 92), (96, 120)], accent)
        roof([(84, 50), (116, 24), (148, 50), (116, 74)], lighten(accent, 0.08))
        draw.rectangle((116, 18, 120, 44), fill=rgba(darken(stone, 0.3)))
        draw.polygon([(120, 18), (150, 26), (120, 30)], fill=rgba(accent))
    elif role == "farm":
        draw.rounded_rectangle((42, 104, 148, 156), radius=8, fill=rgba(lighten(wood, 0.12)), outline=rgba(darken(wood, 0.35)), width=2)
        roof([(36, 106), (96, 68), (156, 106), (96, 128)], accent)
        draw.rectangle((60, 132, 82, 156), fill=rgba(darken(wood, 0.35)))
        for x in range(106, 154, 10):
            draw.line((x, 144, x + 12, 138), fill=rgba((182, 170, 92)), width=3)
    elif role == "barracks":
        draw.rounded_rectangle((28, 98, 164, 160), radius=8, fill=rgba(stone), outline=rgba(darken(stone, 0.4)), width=2)
        roof([(22, 100), (96, 58), (170, 100), (96, 130)], accent)
        draw.rectangle((82, 124, 110, 160), fill=rgba(darken(wood, 0.42)))
        draw.rectangle((34, 110, 54, 132), fill=rgba(lighten(secondary, 0.08)))
        draw.rectangle((138, 110, 158, 132), fill=rgba(lighten(secondary, 0.08)))
    elif role == "range":
        draw.rounded_rectangle((34, 104, 158, 152), radius=8, fill=rgba(lighten(wood, 0.04)), outline=rgba(darken(wood, 0.35)), width=2)
        draw.rectangle((30, 90, 42, 152), fill=rgba(secondary), outline=rgba(darken(secondary, 0.4)), width=2)
        draw.rectangle((150, 90, 162, 152), fill=rgba(secondary), outline=rgba(darken(secondary, 0.4)), width=2)
        outlined(draw, "ellipse", (74, 96, 118, 140), fill=rgba((193, 67, 63)), outline=rgba((74, 24, 18)), width=2)
        outlined(draw, "ellipse", (84, 106, 108, 130), fill=rgba((234, 221, 192)), outline=rgba((74, 24, 18)), width=1)
    elif role == "temple":
        draw.rounded_rectangle((40, 102, 152, 160), radius=8, fill=rgba(lighten(stone, 0.06)), outline=rgba(darken(stone, 0.35)), width=2)
        roof([(32, 104), (96, 50), (160, 104), (96, 124)], lighten(accent, 0.12))
        draw.rectangle((90, 56, 102, 130), fill=rgba(secondary), outline=rgba(darken(secondary, 0.35)), width=2)
        draw.ellipse((86, 42, 106, 62), fill=rgba(lighten(accent, 0.22)))
    elif role == "smith":
        draw.rounded_rectangle((36, 104, 156, 160), radius=8, fill=rgba(stone), outline=rgba(darken(stone, 0.42)), width=2)
        roof([(30, 106), (96, 72), (162, 106), (96, 126)], darken(accent, 0.08))
        draw.rectangle((126, 72, 144, 128), fill=rgba(darken(stone, 0.16)), outline=rgba(darken(stone, 0.42)), width=2)
        fire = gradient_orb(28, (255, 185, 92), (201, 84, 38))
        img.alpha_composite(fire, (62, 122))
        draw.rectangle((56, 136, 118, 146), fill=rgba(darken(wood, 0.12)))
    elif role == "workshop":
        draw.rounded_rectangle((30, 106, 162, 160), radius=8, fill=rgba(stone), outline=rgba(darken(stone, 0.4)), width=2)
        roof([(24, 108), (96, 70), (168, 108), (96, 130)], accent)
        draw.line((118, 78, 152, 46), fill=rgba(lighten(accent, 0.18)), width=4)
        draw.line((128, 88, 110, 60), fill=rgba(lighten(accent, 0.18)), width=3)
        draw.ellipse((150, 42, 160, 52), fill=rgba(accent))
    elif role == "tower":
        draw.rectangle((74, 56, 118, 154), fill=rgba(stone), outline=rgba(darken(stone, 0.4)), width=2)
        roof([(66, 58), (96, 28), (126, 58), (96, 84)], accent)
        draw.rectangle((88, 118, 104, 154), fill=rgba(darken(wood, 0.36)))
        draw.rectangle((78, 74, 114, 84), fill=rgba(darken(secondary, 0.08)))
        if faction == "orc":
            draw.polygon([(72, 58), (66, 40), (84, 54)], fill=rgba(lighten(accent, 0.06)))
            draw.polygon([(120, 58), (126, 40), (108, 54)], fill=rgba(lighten(accent, 0.06)))
    return img


def render_portrait(entity_id: str, faction: str, kind: str) -> Image.Image:
    palette = faction_palette(faction)
    img = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    backdrop = Image.new("RGBA", (128, 128), rgba(darken(palette.cloth, 0.1)))
    badge = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    badge_draw = ImageDraw.Draw(badge)
    badge_draw.rounded_rectangle((10, 10, 118, 118), radius=16, fill=rgba(darken(palette.primary, 0.28)), outline=rgba(lighten(palette.accent, 0.18)), width=3)
    badge_draw.rounded_rectangle((18, 18, 110, 110), radius=12, fill=rgba(lighten(palette.primary, 0.04), 220))
    img.alpha_composite(backdrop)
    img.alpha_composite(badge)
    draw = ImageDraw.Draw(img)
    if kind == "character":
        unit_img = render_unit_frame(entity_id, faction, "idle", 0, 1).resize((96, 96), Image.Resampling.NEAREST)
        img.alpha_composite(unit_img, (16, 20))
    else:
        building_img = render_building_sprite(entity_id, faction).resize((110, 110), Image.Resampling.LANCZOS)
        img.alpha_composite(building_img, (9, 12))
    glow = gradient_orb(72, lighten(palette.accent, 0.18), darken(palette.primary, 0.1))
    img.alpha_composite(glow, (28, 28))
    return img.filter(ImageFilter.GaussianBlur(radius=0.25))


def render_icon(name: str, kind: str) -> Image.Image:
    bg, accent = role_icon_colors(kind)
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((4, 4, 60, 60), radius=12, fill=rgba(bg), outline=rgba(lighten(accent, 0.05)), width=2)
    draw.rounded_rectangle((9, 9, 55, 55), radius=10, fill=rgba(lighten(bg, 0.07)), outline=rgba(darken(bg, 0.3)), width=1)

    if name == "gold":
        draw.polygon([(32, 11), (51, 22), (51, 42), (32, 53), (13, 42), (13, 22)], fill=rgba((234, 196, 80)), outline=rgba((111, 81, 18)), width=2)
    elif name == "wood":
        draw.rounded_rectangle((24, 12, 41, 52), radius=5, fill=rgba((126, 87, 50)), outline=rgba((56, 33, 16)), width=2)
        draw.line((21, 20, 44, 43), fill=rgba((173, 122, 74)), width=2)
        draw.line((44, 20, 21, 43), fill=rgba((173, 122, 74)), width=2)
    elif name == "supply":
        for row in range(3):
            for col in range(3):
                x0 = 16 + col * 11
                y0 = 16 + row * 11
                draw.rounded_rectangle((x0, y0, x0 + 8, y0 + 8), radius=2, fill=rgba(lighten(accent, 0.12)), outline=rgba(darken(accent, 0.45)), width=1)
    elif name in {"attack", "train-melee", "build-barracks"}:
        line_brush(draw, [(21, 44), (43, 18)], fill=rgba((230, 235, 241)), width=4)
        draw.polygon([(41, 17), (49, 15), (47, 24)], fill=rgba((230, 235, 241)))
        draw.rectangle((16, 41, 28, 46), fill=rgba((149, 101, 66)))
    elif name in {"build-archery", "train-ranged"}:
        draw.arc((18, 14, 46, 50), start=275, end=85, fill=rgba((144, 97, 56)), width=4)
        draw.line((32, 17, 32, 49), fill=rgba((231, 235, 240)), width=2)
        draw.line((26, 31, 44, 21), fill=rgba((231, 235, 240)), width=2)
    elif name == "harvest":
        line_brush(draw, [(22, 44), (40, 18)], fill=rgba((150, 111, 74)), width=4)
        draw.line((34, 20, 46, 12), fill=rgba((214, 217, 226)), width=4)
        draw.line((34, 20, 46, 26), fill=rgba((214, 217, 226)), width=4)
    elif name == "build-farm":
        draw.rectangle((18, 34, 46, 48), fill=rgba((191, 168, 92)), outline=rgba((88, 71, 19)), width=2)
        draw.polygon([(14, 34), (32, 18), (50, 34)], fill=rgba((180, 93, 53)), outline=rgba((75, 28, 14)))
        for x in range(18, 46, 6):
            draw.line((x, 34, x + 8, 28), fill=rgba((224, 205, 113)), width=2)
    elif name == "build-blacksmith":
        draw.rectangle((18, 34, 28, 48), fill=rgba((137, 95, 67)))
        draw.rectangle((30, 18, 40, 40), fill=rgba((208, 212, 222)), outline=rgba((76, 80, 92)), width=2)
        draw.rectangle((36, 14, 46, 22), fill=rgba((208, 212, 222)), outline=rgba((76, 80, 92)), width=2)
    elif name == "build-tower":
        draw.rectangle((24, 17, 40, 48), fill=rgba((140, 149, 176)), outline=rgba((55, 58, 76)), width=2)
        draw.polygon([(20, 21), (32, 11), (44, 21)], fill=rgba((194, 105, 65)), outline=rgba((80, 34, 19)))
        draw.rectangle((28, 35, 36, 48), fill=rgba((74, 52, 37)))
    elif name == "train-worker":
        draw.rounded_rectangle((20, 22, 44, 50), radius=6, fill=rgba((88, 132, 195)), outline=rgba((31, 58, 96)), width=2)
        draw.ellipse((23, 10, 41, 27), fill=rgba((226, 196, 154)), outline=rgba((122, 88, 53)), width=2)
    elif name == "stop":
        draw.polygon([(32, 13), (46, 19), (52, 32), (46, 45), (32, 51), (18, 45), (12, 32), (18, 19)], fill=rgba((188, 59, 62)), outline=rgba((83, 18, 24)), width=2)
        draw.rectangle((29, 22, 35, 42), fill=rgba((240, 233, 226)))
    elif name == "heal":
        draw.ellipse((12, 12, 52, 52), fill=rgba((87, 193, 151)), outline=rgba((20, 82, 59)), width=2)
        draw.rectangle((28, 18, 36, 46), fill=rgba((237, 245, 243)))
        draw.rectangle((18, 28, 46, 36), fill=rgba((237, 245, 243)))
    elif name == "protective_chant":
        draw.polygon([(32, 14), (50, 22), (46, 46), (32, 52), (18, 46), (14, 22)], fill=rgba((104, 183, 227)), outline=rgba((20, 71, 106)), width=2)
        draw.rectangle((29, 20, 35, 41), fill=rgba((242, 247, 250)))
        draw.line((21, 31, 43, 31), fill=rgba((242, 247, 250)), width=3)
    elif name == "blood_surge":
        draw.ellipse((13, 13, 51, 51), fill=rgba((190, 62, 70)), outline=rgba((82, 15, 26)), width=2)
        draw.polygon([(31, 16), (40, 31), (31, 48), (23, 31)], fill=rgba((250, 214, 204)))
    elif name == "chain_flame":
        flame = gradient_orb(34, (255, 205, 107), (221, 78, 39))
        img.alpha_composite(flame, (15, 15))
        draw.line((41, 17, 47, 28, 39, 30, 47, 43), fill=rgba((255, 218, 170)), width=3)
    else:
        draw.ellipse((18, 18, 46, 46), fill=rgba(accent), outline=rgba(darken(accent, 0.45)), width=2)
    return img


def render_ui_frame(name: str) -> tuple[Image.Image, int]:
    size = 48 if name == "panel" else 32
    slice_size = 16 if name in {"panel", "minimap"} else 10
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((1, 1, size - 2, size - 2), radius=8, fill=(12, 16, 24, 210), outline=(89, 211, 195, 255), width=2)
    inset = 6 if size == 48 else 4
    draw.rounded_rectangle((inset, inset, size - inset - 1, size - inset - 1), radius=6, fill=(18, 24, 34, 214), outline=(48, 91, 104, 240), width=1)
    corner_color = (219, 185, 94, 255) if name != "portrait" else (106, 198, 218, 255)
    for x, y in ((4, 4), (size - 11, 4), (4, size - 11), (size - 11, size - 11)):
        draw.polygon([(x + 1, y + 7), (x + 7, y + 1), (x + 13, y + 7), (x + 7, y + 13)], fill=corner_color, outline=(44, 29, 12, 255))
    return img, slice_size


def render_vfx(name: str) -> Image.Image:
    if name == "fire":
        return gradient_orb(128, (255, 220, 115), (224, 76, 37), spokes=6).filter(ImageFilter.GaussianBlur(radius=1.4))
    if name == "smoke":
        img = gradient_orb(128, (167, 172, 180), (59, 65, 76))
        return img.filter(ImageFilter.GaussianBlur(radius=4.5))
    if name == "explosion":
        img = gradient_orb(128, (255, 232, 145), (219, 68, 31), spokes=10)
        return img.filter(ImageFilter.GaussianBlur(radius=1.2))
    if name == "heal":
        img = gradient_orb(128, (170, 255, 216), (49, 176, 136), spokes=8)
        return img.filter(ImageFilter.GaussianBlur(radius=1.0))
    if name == "lightning":
        img = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        line_brush(draw, [(68, 12), (50, 42), (72, 46), (40, 86), (62, 88), (52, 118)], fill=rgba((237, 247, 255), 255), width=8)
        line_brush(draw, [(68, 12), (50, 42), (72, 46), (40, 86), (62, 88), (52, 118)], fill=rgba((114, 196, 255), 210), width=16)
        return img.filter(ImageFilter.GaussianBlur(radius=1.2))
    return gradient_orb(128, (255, 255, 255), (90, 210, 255), spokes=12)


def render_terrain_atlas() -> Image.Image:
    atlas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    draw = ImageDraw.Draw(atlas)
    tiles = [
        ("grassland", (88, 138, 72), (56, 96, 51)),
        ("forest", (47, 96, 58), (24, 56, 36)),
        ("cliff", (121, 110, 92), (79, 72, 59)),
        ("road", (171, 147, 103), (126, 103, 68)),
    ]
    rng = random.Random(7)
    for row, (_, base, detail) in enumerate(tiles):
        for col in range(4):
            x0 = col * 64
            y0 = row * 64
            draw.rectangle((x0, y0, x0 + 63, y0 + 63), fill=rgba(base))
            for _ in range(160):
                px = x0 + rng.randint(0, 63)
                py = y0 + rng.randint(0, 63)
                length = rng.randint(2, 6)
                draw.line((px, py, px + length, py + rng.randint(-2, 2)), fill=rgba(lighten(detail, rng.random() * 0.12), rng.randint(80, 160)), width=1)
            if row == 0:
                for _ in range(8):
                    cx = x0 + rng.randint(6, 58)
                    cy = y0 + rng.randint(6, 58)
                    draw.ellipse((cx - 4, cy - 2, cx + 4, cy + 2), fill=rgba(lighten(base, 0.1), 90))
            elif row == 1:
                for _ in range(10):
                    cx = x0 + rng.randint(8, 56)
                    cy = y0 + rng.randint(8, 56)
                    draw.polygon([(cx, cy - 6), (cx + 5, cy + 4), (cx - 5, cy + 4)], fill=rgba(detail, 170))
            elif row == 2:
                for _ in range(7):
                    rx = x0 + rng.randint(4, 52)
                    ry = y0 + rng.randint(4, 52)
                    draw.polygon([(rx, ry + 10), (rx + 8, ry), (rx + 17, ry + 11), (rx + 10, ry + 19)], fill=rgba(darken(base, 0.08), 180), outline=rgba(detail, 180))
            else:
                for offset in range(6, 58, 12):
                    draw.line((x0 + offset - 6, y0 + 6, x0 + offset + 10, y0 + 58), fill=rgba(darken(base, 0.18), 120), width=2)
    return atlas


def save(img: Image.Image, path: Path) -> None:
    ensure_dir(path.parent)
    img.save(path, optimize=True)


def generate() -> None:
    ensure_prerequisites()
    human_units = json.loads((DATA_DIR / "units" / "humans.json").read_text())["units"]
    orc_units = json.loads((DATA_DIR / "units" / "orcs.json").read_text())["units"]
    human_buildings = json.loads((DATA_DIR / "buildings" / "humans.json").read_text())["buildings"]
    orc_buildings = json.loads((DATA_DIR / "buildings" / "orcs.json").read_text())["buildings"]
    spells = json.loads((DATA_DIR / "factions" / "spells.json").read_text())["spells"]

    characters: dict[str, dict] = {}
    buildings: dict[str, dict] = {}

    for faction, unit_defs in (("human", human_units), ("orc", orc_units)):
        for unit in unit_defs:
            unit_id = unit["id"]
            role = UNIT_ROLES[unit_id]
            character_dir = PUBLIC_DIR / "art" / "characters" / unit_id
            states = {}
            for state, frame_count in STATE_FRAMES.items():
                sheet = Image.new("RGBA", (FRAME_SIZE * frame_count, FRAME_SIZE * len(DIRECTION_ORDER)), (0, 0, 0, 0))
                for row, _direction in enumerate(DIRECTION_ORDER):
                    for col in range(frame_count):
                        frame = render_unit_frame(unit_id, faction, state, col, row)
                        sheet.alpha_composite(frame, (col * FRAME_SIZE, row * FRAME_SIZE))
                output = character_dir / f"{unit_id}_{state}_sheet.png"
                save(sheet, output)
                states[state] = {
                    "src": f"/art/characters/{unit_id}/{unit_id}_{state}_sheet.png",
                    "frameSize": FRAME_SIZE,
                    "frameCount": frame_count,
                    "rowCount": len(DIRECTION_ORDER),
                    "directionOrder": DIRECTION_ORDER,
                }

            portrait_output = PUBLIC_DIR / "art" / "portraits" / f"{unit_id}.png"
            save(render_portrait(unit_id, faction, "character"), portrait_output)
            characters[unit_id] = {
                "faction": faction,
                "portrait": f"/art/portraits/{unit_id}.png",
                "worldScale": CHARACTER_WORLD_SCALE[role],
                "states": states,
            }

    for faction, building_defs in (("human", human_buildings), ("orc", orc_buildings)):
        for building in building_defs:
            building_id = building["id"]
            role = BUILDING_ROLES[building_id]
            sprite_output = PUBLIC_DIR / "art" / "buildings" / f"{building_id}.png"
            portrait_output = PUBLIC_DIR / "art" / "portraits" / f"{building_id}.png"
            save(render_building_sprite(building_id, faction), sprite_output)
            save(render_portrait(building_id, faction, "building"), portrait_output)
            buildings[building_id] = {
                "faction": faction,
                "sprite": f"/art/buildings/{building_id}.png",
                "portrait": f"/art/portraits/{building_id}.png",
                "worldScale": BUILDING_WORLD_SCALE[role],
            }

    resource_icons = {}
    for icon_name in ("gold", "wood", "supply"):
        path = PUBLIC_DIR / "art" / "icons" / "resources" / f"{icon_name}.png"
        save(render_icon(icon_name, "resource"), path)
        resource_icons[icon_name] = f"/art/icons/resources/{icon_name}.png"

    command_icon_defs = {
        "harvest": "harvest",
        "build-farm": "build-farm",
        "build-barracks": "build-barracks",
        "build-tower": "build-tower",
        "build-archery": "build-archery",
        "build-blacksmith": "build-blacksmith",
        "train-worker": "train-worker",
        "train-melee": "train-melee",
        "train-ranged": "train-ranged",
        "attack": "attack",
        "stop": "stop",
    }
    command_icons = {}
    for manifest_key, icon_name in command_icon_defs.items():
        path = PUBLIC_DIR / "art" / "icons" / "commands" / f"{manifest_key}.png"
        save(render_icon(icon_name, "command"), path)
        command_icons[manifest_key] = f"/art/icons/commands/{manifest_key}.png"

    ability_icons = {}
    for spell in spells:
        spell_id = spell["id"]
        path = PUBLIC_DIR / "art" / "icons" / "abilities" / f"{spell_id}.png"
        save(render_icon(spell_id, "ability"), path)
        ability_icons[spell_id] = f"/art/icons/abilities/{spell_id}.png"

    ui_frames = {}
    for frame_name in ("panel", "button", "minimap", "portrait"):
        image, slice_size = render_ui_frame(frame_name)
        path = PUBLIC_DIR / "art" / "ui" / f"frame_{frame_name}.png"
        save(image, path)
        ui_frames[frame_name] = {
            "src": f"/art/ui/frame_{frame_name}.png",
            "slice": slice_size,
        }

    vfx = {}
    for effect_name in ("fire", "smoke", "explosion", "heal", "lightning", "hit_spark"):
        actual_name = "lightning" if effect_name == "hit_spark" else effect_name
        path = PUBLIC_DIR / "art" / "vfx" / f"{effect_name}.png"
        save(render_vfx(actual_name), path)
        vfx[effect_name] = f"/art/vfx/{effect_name}.png"

    save(render_terrain_atlas(), TERRAIN_ATLAS_PATH)

    manifest = {
        "version": "1.0.0",
        "characters": characters,
        "buildings": buildings,
        "icons": {
            "resources": resource_icons,
            "commands": command_icons,
            "abilities": ability_icons,
        },
        "ui": {
            "frames": ui_frames,
        },
        "vfx": vfx,
    }
    ensure_dir(MANIFEST_PATH.parent)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Wrote art manifest: {MANIFEST_PATH}")


if __name__ == "__main__":
    if "--check-prerequisites" in sys.argv:
        ensure_prerequisites()
        print("Validated runtime pipeline complete. Final art stage may run.")
    else:
        generate()
