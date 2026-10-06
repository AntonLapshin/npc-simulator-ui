// data/scenes/index.js — scene registry (data-driven, no hardcoded imports).
//
// The renderer never imports a concrete scene file: callers ask for a scene
// by id via getScene(id). To add a scene, create its data file next to
// officeFloor3.js and register it in SCENES below — the scene preview
// (scene.html) picks it up automatically.

import { OFFICE_FLOOR3_ID, OFFICE_FLOOR3_SCENE, OFFICE_FLOOR3_BOUNDS } from "./officeFloor3.js";

export { OFFICE_FLOOR3_ID, OFFICE_FLOOR3_SCENE, OFFICE_FLOOR3_BOUNDS };

const SCENES = {
  [OFFICE_FLOOR3_ID]: OFFICE_FLOOR3_SCENE,
};

/** Look up a registered pretty scene by id (or null when unknown). */
export function getScene(id) {
  return SCENES[id] || null;
}

/** All registered scene ids (for debugging / gallery use). */
export function sceneIds() {
  return Object.keys(SCENES);
}
