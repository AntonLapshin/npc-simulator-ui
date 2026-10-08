// render/objects/sortY.js — shared painters-order key factories.
//
// The scene paints assets south-to-north: the sort key is the southern-most
// floor edge of the footprint. Every object module expresses its sortY with
// one of these factories instead of inlining the arithmetic, so the ordering
// rules stay consistent across objects. An explicit numeric `sort` prop on
// the asset descriptor always wins — that is handled by assetSortY() in
// index.js, not here.

/**
 * Sort key from the footprint's southern edge: `a.y + depth/2`.
 * @param {number} [dflt] fallback depth when the asset has no `d`.
 */
export const sortByFootprint = (dflt) => (a) => a.y + (a.d || dflt || 0) / 2;

/**
 * Sort key for small props sitting on a surface: fixed offset below the
 * anchor point (`a.y`).
 */
export const sortByAnchorOffset = (n) => (a) => (a.y || 0) + n;

/** Sort key for backdrop pieces (walls, windows, wall decor): always last. */
export const sortBackdrop = () => -Infinity;
