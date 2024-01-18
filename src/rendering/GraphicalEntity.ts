import { Container, Graphics, Text } from "pixi.js";
import { PLAYER_HEIGHT, PLAYER_WIDTH } from "../common/Constants";

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

  set nid(value: number) {
    this.nidText.text = `${value}`;
  }
}
