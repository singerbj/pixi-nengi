"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputCommand = exports.inputSchema = void 0;
const nengi_1 = require("nengi");
const ncontext_1 = require("./ncontext");
exports.inputSchema = (0, nengi_1.defineSchema)({
    up: nengi_1.Binary.Boolean,
    down: nengi_1.Binary.Boolean,
    left: nengi_1.Binary.Boolean,
    right: nengi_1.Binary.Boolean,
    shooting: nengi_1.Binary.Boolean,
    mouseX: nengi_1.Binary.Float64,
    mouseY: nengi_1.Binary.Float64,
    delta: nengi_1.Binary.Float64,
    time: nengi_1.Binary.Float64,
});
/**
 * Defines user input representing moving with the keyboard or a directional pad
 */
class InputCommand {
    constructor(delta) {
        this.ntype = ncontext_1.NType.InputCommand;
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.shooting = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.delta = delta;
        this.time = performance.now();
    }
}
exports.InputCommand = InputCommand;
