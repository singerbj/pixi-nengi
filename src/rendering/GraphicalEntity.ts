import { Container, Graphics, Text } from "pixi.js";
import {
  MAX_DISTANCE,
  MIN_FACTOR,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
} from "../common/Constants";

export class GraphicalEntity extends Container {
  graphics: Graphics;
  // serverPositionGraphics: Graphics;
  // serverColliderGraphics: Graphics;
  nidText: Text;
  targetX: number = this.x;
  targetY: number = this.y;

  constructor() {
    super();

    this.graphics = new Graphics();
    this.graphics.beginFill(0xff00ff);
    this.graphics.drawRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
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

    this.nidText = new Text("n/a");
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

  set nid(value: number) {
    this.nidText.text = `${value}`;
  }

  // updateColliderGraphics(entity: Entity, isLocalPlayer: boolean) {
  //   console.log(isLocalPlayer);
  //   if (isLocalPlayer) {
  //     this.serverColliderGraphics.x = entity.x;
  //     this.serverColliderGraphics.y = entity.y;
  //   } else {
  //   }
  // }

  // updatePositionWithInterpolation(entity: Entity) {
  //   this.targetX = entity.x;
  //   this.targetY = entity.y;

  //   this.serverPositionGraphics.x = this.targetX - this.x;
  //   this.serverPositionGraphics.y = this.targetY - this.y;

  //   const distance = calculateDistance(
  //     this.x,
  //     this.y,
  //     this.targetX,
  //     this.targetY
  //   );

  //   let factor: number = 1 - (MAX_DISTANCE - distance) / MAX_DISTANCE;

  //   if (factor < 0 || factor < MIN_FACTOR) {
  //     factor = 1;
  //   }

  //   this.x = lerp(this.x, this.targetX, factor);
  //   this.y = lerp(this.y, this.targetY, factor);
  // }
}
