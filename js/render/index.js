// render/index.js — public API of npc-simulator-ui.
//
// The scene UI knows nothing about the NPC simulator engine (no World,
// Actor or Scenario types). Everything is raw visual input:
//
//   scene  — { meta, floor, corridor, walls, windows, door, wallDecor,
//              floorDecals, lightPatches, assets } (see data/scenes/)
//   chars  — [{ id, name, color, look, prop, x, y, dir, emotion,
//              visible, isUser }]
//            dir is a plan facing: "up" | "down" | "left" | "right"
//            dir is accepted (legacy input) and ignored — everyone faces south.
//   bubbles — [{ x, y, text, kind ("say" | "thought"), name, color, alpha? }]
//   objects — generic fallback boxes [{ id, name, x, y, w, h,
//              passable, blocksVision }] for ids the scene doesn't paint
//
// Render one frame with:
//   import { SceneRenderer, getScene } from "./js/render/index.js";
//   const renderer = new SceneRenderer(canvas, getScene("office_floor3"));
//   renderer.render({ chars, bubbles, objects });

export { SceneRenderer } from "./sceneRenderer.js";
export { drawCharacter } from "./character.js";
export { drawAvatar } from "./avatar.js";
export { drawBubble } from "./bubble.js";
export { paintBackground } from "./background.js";
export { viewOptions } from "./viewOptions.js";
export {
  OBJECT_MODULES,
  OBJECTS,
  showcaseFiles,
  variantProps,
  ASSET_DRAW,
  drawAsset,
  assetSortY,
} from "./objects/index.js";
export {
  OFFICE_FLOOR3_ID,
  OFFICE_FLOOR3_SCENE,
  OFFICE_FLOOR3_BOUNDS,
  getScene,
  sceneIds,
} from "../data/scenes/index.js";
