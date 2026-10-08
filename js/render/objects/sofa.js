// render/objects/sofa.js — three-seater sofa showcase file. FIXED
// orientation: the sofa always faces south (backrest at the north side,
// seat + skirt toward the camera). No rotation, no direction variants.

import { ellShadow, flatRect, rrPath, shade, solidBox } from "../../core/utils.js";
import { sortByFootprint } from "./sortY.js";

export const Sofa = {
  name: "sofa",
  title: "Sofa",
  supportsDirection: false,
  variants: ["Default"],
  defaultProps: {
    asset: "sofa", x: 0, y: 0, w: 132, d: 62, color: "#9b6cf5",
  },

  draw(c, a) {
    const x = a.x, y = a.y, w = a.w || 132, d = a.d || 62;
    const col = a.color || "#9b6cf5";
    const sh = a.sh || 22, bh = a.bh || 34, ah = a.ah || 26, bt = a.bt || 15, at = a.at || 16;
    ellShadow(c, x, y + d / 2 - 2, w * 0.6, d * 0.52, 0.26);

    /* backrest: top edge + inner (south) face visible above the seat */
    const by = y - d / 2 + bt / 2;
    solidBox(c, x, by, w, bt, bh, shade(col, 0.14), shade(col, -0.34), 7);
    c.fillStyle = "rgba(255,255,255,.13)";
    rrPath(c, x - w / 2 + 7, by + bt / 2 - bh + 2, w - 14, 8, 4);
    c.fill();

    /* seat carcass */
    solidBox(c, x, y, w, d, sh, shade(col, 0.24), shade(col, -0.3), 7);

    /* seat cushions on the seat plane */
    const n = 3, gap = 4;
    const ax = x - w / 2 + at + 3;
    const aw = w - at * 2 - 6;
    const ay = y - d / 2 + bt - 4;
    const ah2 = d - bt + 1;
    const cw = (aw - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) {
      const cx = ax + i * (cw + gap);
      flatRect(c, cx, ay, cw, ah2, sh, shade(col, 0.34), 6);
      // top highlight along the cushion's back edge
      c.fillStyle = shade(col, 0.46);
      rrPath(c, cx + 4, ay + 3, cw - 8, 5, 2.5);
      c.fill();
      c.strokeStyle = "rgba(0,0,0,.10)";
      c.lineWidth = 1;
      rrPath(c, cx, ay, cw, ah2, 6);
      c.stroke();
    }

    /* arms */
    solidBox(c, x - w / 2 + at / 2, y, at, d, ah, shade(col, 0.06), shade(col, -0.42), 6);
    solidBox(c, x + w / 2 - at / 2, y, at, d, ah, shade(col, 0.06), shade(col, -0.42), 6);
    c.fillStyle = "rgba(255,255,255,.16)";
    rrPath(c, x - w / 2 + 3, y - d / 2 - ah + 3, at - 6, d - 6, 4);
    c.fill();
    rrPath(c, x + w / 2 - at + 3, y - d / 2 - ah + 3, at - 6, d - 6, 4);
    c.fill();

    /* throw pillows leaning on the backrest */
    pillow(c, x - w / 4 - 4, y - d / 2 + bt - 2, bh - 16, -0.16, "#2ec4a6");
    pillow(c, x + w / 4 + 4, y - d / 2 + bt - 2, bh - 16, 0.16, "#ffb648");
  },

  sortY: sortByFootprint(62),
};

function pillow(c, x, y, z, rot, col) {
  c.save();
  c.translate(x, y - z);
  c.rotate(rot);
  c.fillStyle = col;
  rrPath(c, -10, -9, 20, 18, 5);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.28)";
  rrPath(c, -10, -9, 20, 4, 2);
  c.fill();
  c.fillStyle = "rgba(0,0,0,.12)";
  rrPath(c, -10, 5, 20, 4, 2);
  c.fill();
  c.restore();
}
