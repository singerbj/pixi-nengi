"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBackground = void 0;
const pixi_js_1 = require("pixi.js");
/**
 * Generates a background container with randomly generated circles and a rotated rectangle.
 *
 * @returns {Container} The generated background container.
 */
function generateBackground() {
    const c = new pixi_js_1.Container();
    const xStart = -1000;
    const yStart = -1000;
    const width = 3000;
    const height = 3000;
    const getRandomAlpha = () => {
        const minAlpha = 0.05;
        const maxAlpha = 0.2;
        return Math.random() * (maxAlpha - minAlpha) + minAlpha;
    };
    const colors = [
        "#ff0000",
        "#00ff00",
        "#0000ff",
        "#ffff00",
        "#ff00ff",
        "#00ffff",
    ];
    const generateCircle = () => {
        const g = new pixi_js_1.Graphics();
        g.beginFill(colors[Math.floor(Math.random() * colors.length)]);
        g.drawCircle(xStart + Math.random() * width, yStart + Math.random() * height, Math.random() * 600);
        g.endFill();
        g.alpha = getRandomAlpha();
        c.addChild(g);
    };
    for (let i = 0; i < 30; i++) {
        generateCircle();
    }
    const rectX = -5;
    const rectY = -5;
    const rectWidth = 10;
    const rectHeight = 10;
    const g = new pixi_js_1.Graphics();
    g.beginFill(0xffffff);
    g.drawRect(rectX, rectY, rectWidth, rectHeight);
    g.rotation = 0.785398;
    g.endFill();
    c.addChild(g);
    return c;
}
exports.generateBackground = generateBackground;
