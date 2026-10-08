// render/objects/stool.js — round stool showcase file. FIXED orientation.
import { ell, ellShadow, shade } from "../../core/utils.js";
import { sortByAnchorOffset } from "./sortY.js";

export const Stool = {
  name: "stool",
  title: "Stool",
  supportsDirection: false,
  variants: ["Default"],
  showcaseScale: 1.5, // gallery zoom (scene stays 1:1)
  defaultProps: { asset: "stool", x: 0, y: 0, color: "#ffb648" },

  draw(c, a) {
    const x = a.x, y = a.y, col = a.color || "#ffb648";
    const sw = 30, sd = 26, sh = 24, st = 8;
    ellShadow(c, x, y + sd * 0.32, sw * 0.62, sd * 0.46, 0.22);

    /* four splayed legs + foot ring */
    const floorY = y + sd * 0.32;
    c.strokeStyle = "#6f7c99";
    c.lineWidth = 3.2;
    c.lineCap = "round";
    const feet = [];
    for (let i = 0; i < 4; i++) {
      const an = Math.PI * 0.25 + (i * Math.PI) / 2;
      const fx = x + Math.cos(an) * 12.5, fy = floorY + Math.sin(an) * 5.2;
      feet.push([fx, fy]);
      c.beginPath();
      c.moveTo(x, floorY - 2);
      c.lineTo(fx, fy);
      c.stroke();
    }
    c.lineCap = "butt";
    c.strokeStyle = "rgba(111,124,153,.8)";
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(x, floorY - 6, 9.5, 4, 0, 0, 6.2832);
    c.stroke();
    c.fillStyle = "#6f7c99";
    c.fillRect(x - 3, y + sd / 2 - sh + st - 4, 6, floorY - (y + sd / 2 - sh + st) + 3);

    /* round seat: side band + top ellipse */
    const topCY = y - sh, ry = sd * 0.36;
    c.fillStyle = shade(col, -0.36);
    ell(c, x, topCY + st, sw / 2, ry);
    c.fill();
    c.fillRect(x - sw / 2, topCY, sw, st);
    c.fillStyle = col;
    ell(c, x, topCY, sw / 2, ry);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.3)";
    ell(c, x - 4, topCY - 1.2, sw * 0.24, ry * 0.42);
    c.fill();
    c.strokeStyle = "rgba(0,0,0,.16)";
    c.lineWidth = 1.2;
    ell(c, x, topCY, sw / 2, ry);
    c.stroke();
  },

  sortY: sortByAnchorOffset(13),
};
