import { Container, DisplayObject, Renderer, Text, TextStyle } from "pixi.js";
import { State } from "../client/State";
import { generateBackground } from "../client/generateBackground";
import { Entity } from "../common/Entity";
import { GraphicalEntity } from "./GraphicalEntity";
import { StatsEntity } from "../common/StatsEntity";

export class PIXIRenderer {
  renderer: Renderer;
  stage: Container;
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
      const isLocalPlayer = entity.nid === this.state.myId;
      if (isLocalPlayer) {
        graphicalEntity.x = entity.x;
        graphicalEntity.y = entity.y;
      } else {
        graphicalEntity.updatePositionWithInterpolation(entity);
      }
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

  render() {
    this.renderer.render(this.stage);
  }

  cameraFollow() {
    const playerEntity = this.state.entities.get(this.state.myId);
    if (playerEntity) {
      this.camera.x = -playerEntity.x + window.innerWidth * 0.5;
      this.camera.y = -playerEntity.y + window.innerHeight * 0.5;
    }
  }
}
