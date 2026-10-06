// render/objects/kettle.js — stovewash-style electric kettle showcase file.
// FIXED orientation: spout on the east side, handle arch over the top.
import { ell, rrPath, shade } from "../../core/utils.js";

export const Kettle = {
  name: "kettle",
  title: "Kettle",
  supportsDirection: false,
  variants: ["Default"],
  showcaseScale: 1.7, // gallery zoom (scene stays 1:1)
  defaultProps: { asset: "kettle", x: 0, y: 0, z: 0, color: "#ff5d7a" },

  draw(c, a) {
    const x = a.x, Y = a.y - (a.z || 0), col = a.color || "#ff5d7a";

    c.fillStyle = "rgba(20,26,48,.2)";
    ell(c, x, Y + 0.8, 11, 4.2);
    c.fill();

    /* handle arch (behind the body top) */
    c.strokeStyle = shade(col, -0.32);
    c.lineWidth = 2.6;
    c.beginPath();
    c.moveTo(x - 7.4, Y - 18);
    c.quadraticCurveTo(x, Y - 30, x + 7.4, Y - 18);
    c.stroke();

    /* body */
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x - 9.4, Y - 18);
    c.lineTo(x + 9.4, Y - 18);
    c.lineTo(x + 10.6, Y - 3);
    c.quadraticCurveTo(x + 10.8, Y + 0.4, x + 7.4, Y + 0.4);
    c.lineTo(x - 7.4, Y + 0.4);
    c.quadraticCurveTo(x - 10.8, Y + 0.4, x - 10.6, Y - 3);
    c.closePath();
    c.fill();
    c.save();
    c.clip();
    c.fillStyle = "rgba(255,255,255,.35)";
    rrPath(c, x - 8, Y - 17, 4.4, 16, 2.2);
    c.fill();
    c.fillStyle = "rgba(0,0,0,.14)";
    c.fillRect(x + 6, Y - 18, 6, 19);
    c.restore();

    /* spout (east) */
    c.fillStyle = shade(col, -0.12);
    c.beginPath();
    c.moveTo(x + 9, Y - 16);
    c.lineTo(x + 15.4, Y - 19.6);
    c.lineTo(x + 14.2, Y - 14.4);
    c.lineTo(x + 9.6, Y - 11);
    c.closePath();
    c.fill();

    /* lid */
    c.fillStyle = shade(col, -0.35);
    rrPath(c, x - 9.8, Y - 21.4, 19.6, 4.6, 2.3);
    c.fill();
    c.fillStyle = shade(col, -0.5);
    ell(c, x, Y - 22.4, 3, 1.8);
    c.fill();
  },

  sortY(a) {
    return (a.y || 0) + 2;
  },
};
