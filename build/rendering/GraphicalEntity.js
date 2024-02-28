"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphicalEntity = void 0;
const pixi_js_1 = require("pixi.js");
const Constants_1 = require("../common/Constants");
class GraphicalEntity extends pixi_js_1.Container {
    constructor() {
        super();
        this.targetX = this.x;
        this.targetY = this.y;
        // this.sGraphics = new Graphics();
        // this.sGraphics.beginFill(0x00ffff);
        // this.sGraphics.drawRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
        // this.sGraphics.endFill();
        // this.addChild(this.sGraphics);
        this.graphics = new pixi_js_1.Graphics();
        this.graphics.beginFill(0xff00ff);
        this.graphics.drawRect(0, 0, Constants_1.PLAYER_WIDTH, Constants_1.PLAYER_HEIGHT);
        this.graphics.endFill();
        this.addChild(this.graphics);
        // this.serverPositionGraphics = new Graphics();
        // this.serverPositionGraphics.lineStyle(1, 0x00ff00);
        // this.serverPositionGraphics.drawRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
        // this.addChild(this.serverPositionGraphics);
        // this.serverColliderGraphics = new Graphics();
        // this.serverColliderGraphics.lineStyle(1, 0x0000ff);
        // this.serverColliderGraphics.drawRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
        // this.addChild(this.serverColliderGraphics);
        this.nidText = new pixi_js_1.Text("n/a");
        this.nidText.x = this.graphics.width / 2 - this.nidText.width / 2;
        this.nidText.y = this.graphics.height / 2 - this.nidText.height / 2;
        this.addChild(this.nidText);
    }
    destroy() {
        this.graphics.destroy();
        this.nidText.destroy();
        //this.destroy()
    }
    // note we do not have to define get/set for x,y because these already exist on Container
    set nid(value) {
        this.nidText.text = `${value}`;
    }
}
exports.GraphicalEntity = GraphicalEntity;
