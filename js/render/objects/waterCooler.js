// render/objects/waterCooler.js — water cooler showcase file. FIXED
// orientation: taps and drip tray face south, bottle on top.
import { ellShadow, rrPath } from "../../core/utils.js";

export const WaterCooler = {
  name: "waterCooler",
  title: "Water Cooler",
  supportsDirection: false,
  variants: ["Default"],
  showcaseScale: 1.3, // gallery zoom (scene stays 1:1)
  defaultProps: {
    asset: "waterCooler", x: 0, y: 0, w: 44, d: 42, h: 48,
  },

  draw(c, a) {
    const x = a.x, y = a.y, w = a.w, d = a.d, h = a.h || 48;
    ellShadow(c, x, y + d / 2, w * 0.62, d * 0.52, 0.22);

    /* body */
    const ty0 = y - d / 2 - h, fy0 = y + d / 2 - h;
    c.fillStyle = "#b6c0d6";
    rrPath(c, x - w / 2, fy0 - 4, w, y - fy0 + 4, 5);
    c.fill();
    c.fillStyle = "#e6ebf6";
    rrPath(c, x - w / 2, ty0, w, d, 5);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.5)";
    rrPath(c, x - w / 2 + 3, ty0 + 3, 6, d - 6, 3);
    c.fill();

    /* bottle: water body + cap, seated on the top face */
    const bTop = ty0 - 40;
    c.fillStyle = "rgba(140,205,255,.55)";
    rrPath(c, x - 13, bTop, 26, 42, 9);
    c.fill();
    c.fillStyle = "rgba(90,170,240,.5)";
    rrPath(c, x - 13, bTop + 12, 26, 30, 9);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.45)";
    rrPath(c, x - 9, bTop + 5, 6, 30, 3);
    c.fill();
    c.fillStyle = "#8fd3ff";
    rrPath(c, x - 10, bTop - 5, 20, 7, 3);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.5)";
    rrPath(c, x - 8, bTop - 4, 8, 2.6, 1.3);
    c.fill();

    /* recessed front panel with taps */
    c.fillStyle = "#98a4be";
    rrPath(c, x - w / 2 + 6, fy0 + 6, w - 12, 17, 3);
    c.fill();
    c.fillStyle = "#4f7cff";
    rrPath(c, x - 11, fy0 + 9, 9, 6, 2);
    c.fill();
    c.fillStyle = "#ff5d7a";
    rrPath(c, x + 2, fy0 + 9, 9, 6, 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.4)";
    c.fillRect(x - 11, fy0 + 9, 9, 1.4);
    c.fillRect(x + 2, fy0 + 9, 9, 1.4);

    /* drip tray */
    c.fillStyle = "#8d99b5";
    rrPath(c, x - 13, fy0 + 18, 26, 7, 2.5);
    c.fill();
    c.strokeStyle = "rgba(40,50,80,.4)";
    c.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(x - 9 + i * 6, fy0 + 19.6);
      c.lineTo(x - 9 + i * 6, fy0 + 23.4);
      c.stroke();
    }
  },

  sortY(a) {
    return a.y + (a.d || 0) / 2;
  },
};
