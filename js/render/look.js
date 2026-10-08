// render/look.js — character "look" field accessors with painter defaults.
//
// One place for the fallback palette: every painter reads the look through
// these helpers instead of inlining `L.skin || "#f2cba6"` fallbacks.

import { shade } from "../core/utils.js";

export const skinOf = (L) => L.skin || "#f2cba6";
export const skin2Of = (L) => L.skin2 || shade(skinOf(L), -0.1);
export const hairOf = (L) => L.hair || "#3d2a20";
export const shirtOf = (L) => L.shirt || "#7fb6ff";
export const shirtShadeOf = (L) => L.shirt2 || shade(shirtOf(L), -0.18);
export const pantsOf = (L) => L.pants || "#39435c";
export const shoesOf = (L) => L.shoes || "#1e2434";
export const hairStyleOf = (L) => L.hairStyle || "short";
