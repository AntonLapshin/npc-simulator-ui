// showcase/stage.js — studio-stage placement and painting (no DOM).
//
// The gallery draws every object on a dark "studio" stage: wall-mounted
// pieces hang near the top, floor pieces stand on a floor line, the
// character stands front and center. `placement` computes the anchor from
// the module + props; `paintStage` paints the backdrop, the floor line,
// the (optionally zoomed) object and the character's speech bubble.
// Canvas painting only — no document/window access, so it stays testable.

import { drawBubble } from "../render/bubble.js";

export const STAGE = { w: 560, h: 400 };

/** Wall-mounted pieces hang in the upper half; floor pieces stand lower. */
const WALL_MOUNTED = new Set(["wall", "window", "door", "whiteboard", "clock"]);

/** Floor-level placement for one object module (pure). */
export function placement(module, props) {
  const p = { ...props };
  if (WALL_MOUNTED.has(module.name)) {
    const w = p.w || 180;
    p.x = STAGE.w / 2 - w / 2;
    // Wall segments paint downward from y; decor hangs near the top.
    p.y = module.name === "wall" ? 150 : 130;
    if (module.name === "clock") {
      p.x = STAGE.w / 2;
      p.y = 150;
    }
    if (module.name === "door") {
      p.x = STAGE.w / 2 - p.w / 2;
      p.y = 170;
    }
    return p;
  }
  if (module.name === "character") {
    p.x = STAGE.w / 2;
    p.y = Math.round(STAGE.h * 0.78);
    return p;
  }
  p.x = STAGE.w / 2;
  p.y = Math.round(STAGE.h * 0.62);
  return p;
}

function paintBackdrop(ctx) {
  const { w: W, h: H } = STAGE;
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0d1526");
  bg.addColorStop(1, "#080d18");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // faint studio grid
  ctx.strokeStyle = "rgba(255,255,255,.045)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(W, y + 0.5);
    ctx.stroke();
  }
}

/** Floor line for standing objects (inside the zoom so it stays glued). */
function paintFloorLine(ctx, module, props, zs) {
  if (WALL_MOUNTED.has(module.name)) return;
  const { w: W } = STAGE;
  ctx.strokeStyle = "rgba(255,255,255,.12)";
  ctx.lineWidth = 1.5 / zs;
  ctx.beginPath();
  ctx.moveTo(40, props.y + 14.5);
  ctx.lineTo(W - 40, props.y + 14.5);
  ctx.stroke();
}

/** Paint the staged object; returns the render error (if any). */
function paintObject(ctx, module, props) {
  try {
    module.draw(ctx, props);
    // optional speech bubble (character config)
    if (props.speech) {
      drawBubble(ctx, {
        x: props.x, y: props.y - (props.pose === "prone" ? 26 : 0),
        text: props.speechText || "Hi! Nice to meet you.",
        kind: "say", name: props.name || "NPC", color: props.color || "#4f7cff",
      }, [], STAGE);
    }
    return null;
  } catch (err) {
    return err;
  }
}

function paintError(ctx, module, err) {
  const { w: W, h: H } = STAGE;
  console.error(`[showcase:${module.name}]`, err);
  ctx.fillStyle = "#ff5d7a";
  ctx.font = "600 13px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`render error: ${err.message}`, W / 2, H / 2);
  ctx.textAlign = "left";
}

/** Paint the full studio stage for one object module + props. */
export function paintStage(ctx, module, props) {
  paintBackdrop(ctx);
  // gallery zoom around the placement anchor (scene renders stay 1:1)
  const zs = module.showcaseScale || 1;
  ctx.save();
  if (zs !== 1) {
    ctx.translate(props.x, props.y);
    ctx.scale(zs, zs);
    ctx.translate(-props.x, -props.y);
  }
  paintFloorLine(ctx, module, props, zs);
  const stageErr = paintObject(ctx, module, props);
  ctx.restore();
  if (stageErr) paintError(ctx, module, stageErr);
}
