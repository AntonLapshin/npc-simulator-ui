// render/objects/cup.js — mug showcase file. FIXED orientation (handle on
// the east side, rim + coffee read from above).
import { ell } from "../../core/utils.js";
import { sortByAnchorOffset } from "./sortY.js";

export const Cup = {
  name: "cup",
  title: "Mug",
  supportsDirection: false,
  variants: ["Default"],
  showcaseScale: 2.4, // gallery zoom (scene stays 1:1)
  defaultProps: { asset: "cup", x: 0, y: 0, z: 0, color: "#ff5d7a" },

  draw(c, a) {
    const x = a.x, Y = a.y - (a.z || 0), col = a.color || "#ffffff";
    c.fillStyle = "rgba(30,25,50,.20)";
    ell(c, x, Y + 1.2, 7.2, 3);
    c.fill();
    /* handle — arc ends tuck under the body so it reads attached */
    c.strokeStyle = "#e2dbcd";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(x + 4.0, Y - 5.4, 3.6, -1.45, 1.45);
    c.stroke();
    /* body: slight taper, rounded bottom */
    c.fillStyle = "#f7f4ee";
    c.beginPath();
    c.moveTo(x - 5.2, Y - 10);
    c.lineTo(x + 5.2, Y - 10);
    c.lineTo(x + 4.4, Y - 1);
    c.quadraticCurveTo(x + 4.2, Y + 0.6, x + 2.6, Y + 0.6);
    c.lineTo(x - 2.6, Y + 0.6);
    c.quadraticCurveTo(x - 4.2, Y + 0.6, x - 4.4, Y - 1);
    c.closePath();
    c.fill();
    /* colour band */
    c.save();
    c.clip();
    c.fillStyle = col;
    c.fillRect(x - 6, Y - 10, 12, 4.4);
    c.fillStyle = "rgba(255,255,255,.5)";
    c.fillRect(x - 3.8, Y - 8.6, 1.8, 8.4);
    c.fillStyle = "rgba(0,0,0,.10)";
    c.fillRect(x + 2.6, Y - 10, 3.4, 11);
    c.restore();
    /* rim + coffee */
    c.fillStyle = "#fdfbf6";
    ell(c, x, Y - 10, 5.2, 2.1);
    c.fill();
    c.fillStyle = "rgba(120,80,50,.62)";
    ell(c, x, Y - 10, 3.9, 1.5);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.35)";
    ell(c, x - 1.2, Y - 10.4, 1.4, 0.5);
    c.fill();
  },

  sortY: sortByAnchorOffset(2),
};
