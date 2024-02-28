import { StaticCollidable, CollidableType, CustomBox } from "./Collidable";
// import { MAP_OBJECT_STANDARD_FACTOR } from "../common/Constants";

export class MapObject implements StaticCollidable {
  x: number;
  y: number;
  width: number;
  height: number;
  collidableType: CollidableType = "MapObject";
  collider: CustomBox;
  scollider: CustomBox;
  colliderOptions = {
    isStatic: true,
  };

  constructor(x: number, y: number, width: number, height: number) {
    // const width = widthTiles * MAP_OBJECT_STANDARD_FACTOR;
    // const height = heightTiles * MAP_OBJECT_STANDARD_FACTOR;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.collider = new CustomBox(
      { x, y },
      width,
      height,
      "MapObject",
      this.colliderOptions
    );
    this.scollider = new CustomBox(
      { x, y },
      width,
      height,
      "MapObject",
      this.colliderOptions
    );
  }
}
