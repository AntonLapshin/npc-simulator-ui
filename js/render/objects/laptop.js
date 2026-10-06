// render/objects/laptop.js — open laptop showcase file. FIXED orientation:
// the laptop always faces NORTH (screen away from the camera), so the view
// shows the LID BACK + hinge + a sliver of the base's south edge. This is the
// one object that faces north — a person sitting south of it (facing south
// at a desk… or north of it at a desk chair) sees the screen; we never do.

import { rrPath } from "../../core/utils.js";

export const Laptop = {
  name: "laptop",
  title: "Laptop",
  supportsDirection: false,
  variants: ["Default"],
  showcaseScale: 1.6, // gallery zoom (scene stays 1:1)
  defaultProps: { asset: "laptop", x: 0, y: 0, z: 0 },

  draw(c, a) {
    const x = a.x, Y = a.y - (a.z || 0);

    /* contact shadow on the desk */
    c.fillStyle = "rgba(24,28,54,.20)";
    rrPath(c, x - 20, Y - 4, 40, 10, 4);
    c.fill();

    /* base slab: south face + a sliver of top deck behind the hinge */
    c.fillStyle = "#98a4be";
    rrPath(c, x - 19, Y - 5, 38, 6, 2.4);
    c.fill();
    c.fillStyle = "#c3ccdf";
    rrPath(c, x - 19, Y - 8, 38, 4.4, 2.2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.5)";
    c.fillRect(x - 19, Y - 8, 38, 1.2);

    /* hinge */
    c.fillStyle = "#232c42";
    rrPath(c, x - 15, Y - 10.4, 30, 3.4, 1.7);
    c.fill();

    /* lid back */
    c.fillStyle = "#2b3757";
    rrPath(c, x - 17, Y - 40, 34, 31, 4);
    c.fill();
    c.fillStyle = "#3b4c78";
    rrPath(c, x - 17, Y - 40, 34, 4, 2);
    c.fill();
    c.fillStyle = "rgba(150,200,255,.14)";
    rrPath(c, x - 14, Y - 36.5, 28, 24, 3);
    c.fill();
    /* logo */
    c.save();
    c.translate(x, Y - 24.5);
    c.rotate(Math.PI / 4);
    c.fillStyle = "rgba(190,225,255,.85)";
    c.fillRect(-3, -3, 6, 6);
    c.restore();
    /* edge light along the lid top */
    c.fillStyle = "rgba(170,220,255,.35)";
    c.fillRect(x - 17, Y - 40, 34, 1.5);
    /* side shading */
    c.fillStyle = "rgba(0,0,0,.18)";
    rrPath(c, x + 13, Y - 39, 4, 29, 2);
    c.fill();
  },

  sortY(a) {
    return (a.y || 0) + 5;
  },
};
