"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PIXIRenderer = void 0;
const pixi_js_1 = require("pixi.js");
const generateBackground_1 = require("./generateBackground");
const GraphicalEntity_1 = require("./GraphicalEntity");
const Constants_1 = require("../common/Constants");
class PIXIRenderer {
    constructor(state) {
        this.state = state;
        this.graphicalEntitites = new Map();
        const canvas = document.getElementById("main-canvas");
        this.renderer = new pixi_js_1.Renderer({
            view: canvas,
            width: window.innerWidth,
            height: window.innerHeight,
        });
        window.addEventListener("resize", () => {
            this.renderer.resize(window.innerWidth, window.innerHeight);
        });
        this.stage = new pixi_js_1.Container();
        this.stage.eventMode = "static";
        this.background = new pixi_js_1.Graphics();
        this.background.beginFill(0x222222);
        this.background.drawRect(this.renderer.screen.x, this.renderer.screen.y, this.renderer.screen.width, this.renderer.screen.height);
        this.background.endFill();
        this.stage.addChild(this.background);
        this.localPlayerGhost = new pixi_js_1.Graphics();
        this.localPlayerGhost.lineStyle(1, 0xff00ff);
        this.localPlayerGhost.drawRect(0, 0, Constants_1.PLAYER_WIDTH, Constants_1.PLAYER_HEIGHT);
        this.localPlayerGhost.endFill();
        this.softLocalPlayerGhost = new pixi_js_1.Graphics();
        this.softLocalPlayerGhost.lineStyle(1, 0x00ffff);
        this.softLocalPlayerGhost.drawRect(0, 0, Constants_1.PLAYER_WIDTH, Constants_1.PLAYER_HEIGHT);
        this.softLocalPlayerGhost.endFill();
        this.stats = new pixi_js_1.Text("", new pixi_js_1.TextStyle({
            fill: "#ffffff",
            strokeThickness: 3,
            fontSize: 14,
        }));
        this.camera = new pixi_js_1.Container();
        this.camera.addChild((0, generateBackground_1.generateBackground)());
        this.camera.addChild(this.softLocalPlayerGhost);
        this.camera.addChild(this.localPlayerGhost);
        this.stage.addChild(this.stats);
        this.stage.addChild(this.camera);
    }
    addEntity(entity) {
        const graphicalEntity = new GraphicalEntity_1.GraphicalEntity();
        Object.assign(graphicalEntity, entity);
        this.camera.addChild(graphicalEntity);
        this.graphicalEntitites.set(entity.nid, graphicalEntity);
    }
    removeEntity(entity) {
        const graphicalEntity = this.graphicalEntitites.get(entity.nid);
        if (graphicalEntity) {
            this.camera.removeChild(graphicalEntity);
            graphicalEntity.destroy();
        }
    }
    // renderGraphicalEntity(entity: Entity) {
    //   const graphicalEntity = this.graphicalEntitites.get(entity.nid);
    //   if (graphicalEntity) {
    //     graphicalEntity.updatePositionWithInterpolation(entity);
    //   }
    // }
    updateGraphicalEntity(entity) {
        const graphicalEntity = this.graphicalEntitites.get(entity.nid);
        if (graphicalEntity) {
            graphicalEntity.x = entity.x;
            graphicalEntity.y = entity.y;
            // graphicalEntity.sGraphics.x = entity.sx;
            // graphicalEntity.sGraphics.y = entity.sx;
            // console.log(entity.x, entity.sx);
            // const tempBox = new Graphics();
            // tempBox.lineStyle(1, 0xff00ff); //(thickness, color)
            // tempBox.drawRect(entity.sx, entity.sx, PLAYER_WIDTH, PLAYER_HEIGHT);
            // tempBox.endFill();
            // this.camera.addChild(tempBox);
            // setTimeout(() => {
            //   tempBox.destroy();
            // }, 500);
        }
    }
    renderStats(entity) {
        const { averageDeltaMs, averageCPUFrameMs, userCount, entityCount } = entity;
        this.stats.text = `
    averageCPUFrameMs: ${averageCPUFrameMs}
    averageDeltaMs: ${averageDeltaMs}
    userCount: ${userCount}
    entityCount: ${entityCount}
    `;
    }
    updateBackground() {
        this.background.x = this.renderer.screen.x;
        this.background.y = this.renderer.screen.y;
        this.background.width = this.renderer.screen.width;
        this.background.height = this.renderer.screen.height;
    }
    render() {
        this.updateBackground();
        this.renderer.render(this.stage);
    }
    cameraFollow() {
        const entity = this.state.entities.get(this.state.myId);
        if (entity) {
            this.camera.x =
                -entity.x + this.renderer.screen.width / 2 - Constants_1.PLAYER_WIDTH / 2;
            this.camera.y =
                -entity.y + this.renderer.screen.height / 2 - Constants_1.PLAYER_HEIGHT / 2;
        }
    }
    renderShot(shotMessage) {
        const { originX, originY, targetX, targetY, hit, hitX, hitY, hitEntityId } = shotMessage;
        let line = new pixi_js_1.Graphics();
        let hitPoint = undefined;
        if (hit) {
            hitPoint = new pixi_js_1.Graphics();
            hitPoint
                .lineStyle(10, hitEntityId !== 0 ? 0xff0000 : 0x0000ff)
                .moveTo(hitX - 4, hitY - 4)
                .lineTo(hitX + 4, hitY + 4);
            line
                .lineStyle(1, hit ? 0x00ff00 : 0xffffff)
                .moveTo(originX, originY)
                .lineTo(hitX, hitY);
        }
        else {
            line
                .lineStyle(1, hit ? 0x00ff00 : 0xffffff)
                .moveTo(originX, originY)
                .lineTo(targetX, targetY);
        }
        this.camera.addChild(line);
        hitPoint !== undefined && this.camera.addChild(hitPoint);
        setTimeout(() => {
            line.destroy();
        }, 250);
        setTimeout(() => {
            hitPoint && hitPoint.destroy();
        }, 100);
    }
    renderMap(mapObjects) {
        mapObjects.forEach((mapObject) => {
            const mapObjectGraphic = new pixi_js_1.Graphics();
            mapObjectGraphic.beginFill(0xdddddd);
            mapObjectGraphic.drawRect(mapObject.x, mapObject.y, mapObject.width, mapObject.height);
            mapObjectGraphic.endFill();
            this.camera.addChild(mapObjectGraphic);
        });
    }
    updateLocalPlayerGhost(prop, value) {
        if (prop === "x") {
            this.localPlayerGhost.x = value;
        }
        else if (prop === "y") {
            this.localPlayerGhost.y = value;
        }
        if (prop === "sx") {
            this.softLocalPlayerGhost.x = value;
        }
        else if (prop === "sy") {
            this.softLocalPlayerGhost.y = value;
        }
    }
}
exports.PIXIRenderer = PIXIRenderer;
