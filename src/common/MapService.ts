import { MAP_OBJECT_STANDARD_FACTOR } from "./Constants";
import { MapObject } from "./MapObject";

export const getMap = (): MapObject[] => {
  const floor = new MapObject(
    -1000,
    500,
    2000 + MAP_OBJECT_STANDARD_FACTOR,
    MAP_OBJECT_STANDARD_FACTOR
  );
  const leftWall = new MapObject(-1000, -500, MAP_OBJECT_STANDARD_FACTOR, 1000);
  const rightWall = new MapObject(1000, -500, MAP_OBJECT_STANDARD_FACTOR, 1000);
  const ceiling = new MapObject(-1000, -500, 2000, MAP_OBJECT_STANDARD_FACTOR);
  return [floor, leftWall, rightWall, ceiling];
};
