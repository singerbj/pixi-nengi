import { MAP_OBJECT_STANDARD_FACTOR } from "./Constants";
import { MapObject } from "./MapObject";

const floor = new MapObject(
  -1000,
  500,
  2000 + MAP_OBJECT_STANDARD_FACTOR,
  MAP_OBJECT_STANDARD_FACTOR
);
const leftWall = new MapObject(-1000, -500, MAP_OBJECT_STANDARD_FACTOR, 1000);
const rightWall = new MapObject(1000, -500, MAP_OBJECT_STANDARD_FACTOR, 1000);
const ceiling = new MapObject(-1000, -500, 2000, MAP_OBJECT_STANDARD_FACTOR);
const middleObstacle = new MapObject(
  (-MAP_OBJECT_STANDARD_FACTOR * 6) / 2,
  400,
  MAP_OBJECT_STANDARD_FACTOR * 6,
  100
);

const leftWallJumpWall = new MapObject(
  -850,
  -300,
  MAP_OBJECT_STANDARD_FACTOR,
  700
);
const rightWallJumpWall = new MapObject(
  850,
  -300,
  MAP_OBJECT_STANDARD_FACTOR,
  700
);

export const getMap = (): MapObject[] => {
  return [
    floor,
    leftWall,
    rightWall,
    ceiling,
    middleObstacle,
    leftWallJumpWall,
    rightWallJumpWall,
  ];
};
