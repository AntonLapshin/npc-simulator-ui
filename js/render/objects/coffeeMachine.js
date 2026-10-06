// render/objects/coffeeMachine.js — espresso machine showcase file.
// FIXED orientation: control panel and brew bay face south. Sits on a
// counter via `z`.
import { ell, rrPath } from "../../core/utils.js";

export const CoffeeMachine = {
  name: "coffeeMachine",
  title: "Coffee Machine",
  supportsDirection: false,
  variants: ["Default"],
  showcaseScale: 1.5, // gallery zoom (scene stays 1:1)
  defaultProps: { asset: "coffeeMachine", x: 0, y: 0, z: 0 },

  draw(c, a) {
    const x = a.x, Y = a.y - (a.z || 0);

    c.fillStyle = "rgba(20,26,48,.22)";
    rrPath(c, x - 21, Y - 4, 42, 9, 3);
    c.fill();

    /* body: top face then south face */
    c.fillStyle = "#39445f";
    rrPath(c, x - 21, Y - 50, 42, 10, 4);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.14)";
    rrPath(c, x - 18, Y - 48.6, 36, 3, 1.5);
    c.fill();
    c.fillStyle = "#232c42";
    rrPath(c, x - 21, Y - 42, 42, 42, 4);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.08)";
    c.fillRect(x - 21, Y - 42, 3, 42);
    c.fillStyle = "rgba(0,0,0,.22)";
    c.fillRect(x + 15, Y - 42, 6, 42);

    /* control strip: display + two lights */
    c.fillStyle = "#39445f";
    rrPath(c, x - 17, Y - 39, 34, 10, 2.5);
    c.fill();
    c.fillStyle = "#8fd3ff";
    rrPath(c, x - 14, Y - 37, 16, 6, 1.6);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.5)";
    rrPath(c, x - 12.6, Y - 35.8, 5, 3.6, 1.2);
    c.fill();
    c.fillStyle = "#ff5d7a";
    ell(c, x + 7, Y - 34, 2.6, 2.6);
    c.fill();
    c.fillStyle = "#2ec4a6";
    ell(c, x + 13, Y - 34, 2.6, 2.6);
    c.fill();

    /* brew bay recess + spout */
    c.fillStyle = "#161d2e";
    rrPath(c, x - 13, Y - 27, 26, 17, 2.5);
    c.fill();
    c.fillStyle = "#c8d0e0";
    rrPath(c, x - 5, Y - 27, 10, 5, 1.6);
    c.fill();
    /* coffee stream: spout down into the cup */
    c.fillStyle = "#6b4a2f";
    rrPath(c, x - 1.6, Y - 22.4, 3.2, 8.8, 1);
    c.fill();

    /* cup seated on the drip tray (base tucked behind the tray front) */
    c.fillStyle = "#f7f4ee";
    rrPath(c, x - 4.6, Y - 14, 9.2, 8.6, 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.5)";
    c.fillRect(x - 3.4, Y - 12.6, 1.6, 6);

    /* drip tray */
    c.fillStyle = "#c8d0e0";
    rrPath(c, x - 15, Y - 9.6, 30, 5.4, 2);
    c.fill();
    c.strokeStyle = "rgba(60,70,100,.5)";
    c.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.moveTo(x - 11 + i * 5.5, Y - 8.6);
      c.lineTo(x - 11 + i * 5.5, Y - 5.4);
      c.stroke();
    }
  },

  sortY(a) {
    return (a.y || 0) + 2;
  },
};
