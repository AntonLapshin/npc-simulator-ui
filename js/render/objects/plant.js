// render/objects/plant.js — potted plant showcase file. FIXED orientation.
import { ell, ellShadow, poly, rrPath, shade } from "../../core/utils.js";
import { sortByAnchorOffset } from "./sortY.js";

export const Plant = {
  name: "plant",
  title: "Plant",
  supportsDirection: false,
  variants: ["Default"],
  showcaseScale: 1.25, // gallery zoom (scene stays 1:1)
  defaultProps: { asset: "plant", x: 0, y: 0, s: 1.0, pot: "#2ec4a6" },

  draw(c, a) {
    const x = a.x, y = a.y, s = a.s || 1;
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.translate(-x, -y);

    ellShadow(c, x, y + 6, 19, 7.5, 0.26);

    /* foliage first (behind the pot rim): a bushy fan of leaves */
    /* rosette: every leaf springs from the pot mouth */
    const leaves = [
      [1.18, 15], [0.84, 19], [0.5, 22], [0.18, 25], [-0.14, 25],
      [-0.46, 22], [-0.8, 19], [-1.14, 15], [0.02, 27],
    ];
    for (let i = 0; i < leaves.length; i++) {
      const [rot, len] = leaves[i];
      c.save();
      c.translate(x + (i % 2 ? 1.4 : -1.4), y - 25);
      c.rotate(rot);
      c.fillStyle = i % 2 ? "#2f9e6a" : "#37b87c";
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(-9.5, -len * 0.45, -4.4, -len);
      c.quadraticCurveTo(0, -len - 4, 4.4, -len);
      c.quadraticCurveTo(9.5, -len * 0.45, 0, 0);
      c.closePath();
      c.fill();
      c.fillStyle = "rgba(255,255,255,.20)";
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(-9.5, -len * 0.45, -4.4, -len);
      c.quadraticCurveTo(-1.4, -len * 0.5, 0, 0);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(20,60,40,.25)";
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(0, -1);
      c.lineTo(0, -len + 2);
      c.stroke();
      c.restore();
    }
    /* a couple of highlight berries for depth */
    c.fillStyle = "rgba(255,255,255,.28)";
    ell(c, x - 7, y - 42, 2.2, 2.2);
    c.fill();
    ell(c, x + 8, y - 37, 1.8, 1.8);
    c.fill();

    /* pot: tapered body + rim + soil */
    c.fillStyle = a.pot || "#c98a5e";
    poly(c, [[x - 14, y - 22], [x + 14, y - 22], [x + 10, y + 6], [x - 10, y + 6]]);
    c.fillStyle = "rgba(255,255,255,.22)";
    poly(c, [[x - 14, y - 22], [x - 6, y - 22], [x - 7.6, y + 6], [x - 10, y + 6]]);
    c.fillStyle = "rgba(0,0,0,.14)";
    poly(c, [[x + 14, y - 22], [x + 8, y - 22], [x + 6.4, y + 6], [x + 10, y + 6]]);
    c.fillStyle = "#3c2a1e";
    rrPath(c, x - 12, y - 24.6, 24, 4, 2);
    c.fill();
    c.fillStyle = shade(a.pot || "#c98a5e", 0.26);
    rrPath(c, x - 16, y - 28, 32, 6.4, 3);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.3)";
    rrPath(c, x - 16, y - 28, 32, 2, 1);
    c.fill();

    c.restore();
  },

  sortY: sortByAnchorOffset(8),
};
