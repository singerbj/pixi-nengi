import { Container, Graphics, Renderer, Text, TextStyle } from "pixi.js";
import { State } from "../client/State";
import { generateBackground } from "./generateBackground";
import { Entity } from "../common/Entity";
import { GraphicalEntity } from "./GraphicalEntity";
import { StatsEntity } from "../common/StatsEntity";
import { PLAYER_HEIGHT, PLAYER_WIDTH } from "../common/Constants";
import { ShotMessage } from "../common/ShotMessage";
import { MapObject } from "../common/MapObject";

export class PIXIRenderer {
  renderer: Renderer;
  stage: Container;
  background: Graphics;
  stats: Text;
  camera: Container;
  graphicalEntitites: Map<number, GraphicalEntity>;
  state: State;
  localPlayerGhost: Graphics;
  softLocalPlayerGhost: Graphics;

  constructor(state: State) {
    this.state = state;
    this.graphicalEntitites = new Map();

    const canvas: HTMLCanvasElement = document.getElementById(
      "main-canvas"
    ) as HTMLCanvasElement;
    this.renderer = new Renderer({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    window.addEventListener("resize", () => {
      this.renderer.resize(window.innerWidth, window.innerHeight);
    });

    this.stage = new Container();
    this.stage.eventMode = "static";
    this.background = new Graphics();
    this.background.beginFill(0x222222);
    this.background.drawRect(
      this.renderer.screen.x,
      this.renderer.screen.y,
      this.renderer.screen.width,
      this.renderer.screen.height
    );
    this.background.endFill();
    this.stage.addChild(this.background);

    this.localPlayerGhost = new Graphics();
    this.localPlayerGhost.lineStyle(1, 0xff00ff);
    this.localPlayerGhost.drawRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    this.localPlayerGhost.endFill();
    this.softLocalPlayerGhost = new Graphics();
    this.softLocalPlayerGhost.lineStyle(1, 0x00ffff);
    this.softLocalPlayerGhost.drawRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    this.softLocalPlayerGhost.endFill();

    this.stats = new Text(
      "",
      new TextStyle({
        fill: "#ffffff",
        strokeThickness: 3,
        fontSize: 14,
      })
    );
    this.camera = new Container();
    this.camera.addChild(generateBackground());
    this.camera.addChild(this.softLocalPlayerGhost);
    this.camera.addChild(this.localPlayerGhost);
    this.stage.addChild(this.stats);
    this.stage.addChild(this.camera);
  }

  addEntity(entity: Entity) {
    const graphicalEntity = new GraphicalEntity();
    Object.assign(graphicalEntity, entity);
    this.camera.addChild(graphicalEntity);
    this.graphicalEntitites.set(entity.nid, graphicalEntity);
  }

  removeEntity(entity: Entity) {
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

  updateGraphicalEntity(entity: Entity) {
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

  renderStats(entity: StatsEntity) {
    const { averageDeltaMs, averageCPUFrameMs, userCount, entityCount } =
      entity;
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
        -entity.x + this.renderer.screen.width / 2 - PLAYER_WIDTH / 2;
      this.camera.y =
        -entity.y + this.renderer.screen.height / 2 - PLAYER_HEIGHT / 2;
    }
  }

  renderShot(shotMessage: ShotMessage) {
    const { originX, originY, targetX, targetY, hit, hitX, hitY, hitEntityId } =
      shotMessage;

    let line = new Graphics();

    let hitPoint: Graphics | undefined = undefined;
    if (hit) {
      hitPoint = new Graphics();
      hitPoint
        .lineStyle(10, hitEntityId !== 0 ? 0xff0000 : 0x0000ff)
        .moveTo(hitX - 4, hitY - 4)
        .lineTo(hitX + 4, hitY + 4);

      line
        .lineStyle(1, hit ? 0x00ff00 : 0xffffff)
        .moveTo(originX, originY)
        .lineTo(hitX, hitY);
    } else {
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

  renderMap(mapObjects: MapObject[]) {
    mapObjects.forEach((mapObject) => {
      const mapObjectGraphic = new Graphics();
      mapObjectGraphic.beginFill(0xdddddd);
      mapObjectGraphic.drawRect(
        mapObject.x,
        mapObject.y,
        mapObject.width,
        mapObject.height
      );
      mapObjectGraphic.endFill();
      this.camera.addChild(mapObjectGraphic);
    });
  }

  updateLocalPlayerGhost(prop: any, value: any) {
    if (prop === "x") {
      this.localPlayerGhost.x = value;
    } else if (prop === "y") {
      this.localPlayerGhost.y = value;
    }
    if (prop === "sx") {
      this.softLocalPlayerGhost.x = value;
    } else if (prop === "sy") {
      this.softLocalPlayerGhost.y = value;
    }
  }
}
