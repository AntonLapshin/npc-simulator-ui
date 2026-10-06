// render/objects/crates.js — stacked crates showcase file. FIXED orientation.
import { ellShadow, solidBox } from "../../core/utils.js";

export const Crates = {
  name: "crates",
  title: "Crates",
  supportsDirection: false,
  variants: ["Default"],
  showcaseScale: 1.35, // gallery zoom (scene stays 1:1)
  defaultProps: { asset: "crates", x: 0, y: 0, color: "#c98a5e" },

  draw(c, a) {
    const x = a.x, y = a.y;
    ellShadow(c, x + 2, y + 18, 40, 14, 0.22);
    /* two crates on the floor */
    solidBox(c, x - 15, y + 6, 32, 28, 28, "#d9a06a", "#b07c4c", 4);
    crateLines(c, x - 15, y + 6, 32, 28, 28);
    solidBox(c, x + 19, y + 8, 26, 24, 22, "#c98a5e", "#a26c44", 4);
    crateLines(c, x + 19, y + 8, 26, 24, 22);
    /* one crate stacked on the left one (sits on its top face) */
    solidBox(c, x - 15, y - 22, 30, 26, 24, "#e0b483", "#b98d5f", 4);
    crateLines(c, x - 15, y - 22, 30, 26, 24);
  },

  sortY(a) {
    return (a.y || 0) + 20;
  },
};

/** Two plank grooves on the south face of a crate. */
function crateLines(c, x, y, w, d, h) {
  const fy0 = y + d / 2 - h, fy1 = y + d / 2;
  c.strokeStyle = "rgba(90,60,30,.30)";
  c.lineWidth = 1.6;
  for (const t of [0.36, 0.68]) {
    const ly = fy0 + (fy1 - fy0) * t;
    c.beginPath();
    c.moveTo(x - w / 2 + 3, ly);
    c.lineTo(x + w / 2 - 3, ly);
    c.stroke();
  }
}
