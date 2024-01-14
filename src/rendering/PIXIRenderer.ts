import { Container, Graphics, Renderer, Text, TextStyle } from "pixi.js";
import { State } from "../client/State";
import { generateBackground } from "./generateBackground";
import { Entity } from "../common/Entity";
import { GraphicalEntity } from "./GraphicalEntity";
import { StatsEntity } from "../common/StatsEntity";
import { ShootingInfo } from "../common/handleInput";
import { PLAYER_HEIGHT, PLAYER_WIDTH } from "../common/Constants";

export class PIXIRenderer {
  renderer: Renderer;
  stage: Container;
  background: Graphics;
  stats: Text;
  camera: Container;
  graphicalEntitites: Map<number, GraphicalEntity>;
  state: State;

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
      // const isLocalPlayer = entity.nid === this.state.myId;
      // if (isLocalPlayer) {
      graphicalEntity.x = entity.x;
      graphicalEntity.y = entity.y;
      // } else {
      //   graphicalEntity.updatePositionWithInterpolation(entity);
      // }
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

  renderShot(shootingInfo: ShootingInfo) {
    const { entity, mouseX, mouseY } = shootingInfo;

    let line = new Graphics();
    line
      .lineStyle(1, 0xffffff)
      .moveTo(entity.x + PLAYER_WIDTH / 2, entity.y + PLAYER_HEIGHT / 2)
      .lineTo(mouseX, mouseY);

    this.camera.addChild(line);

    setTimeout(() => {
      line.destroy();
    }, 250);
  }
}
