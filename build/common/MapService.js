"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMap = void 0;
const Constants_1 = require("./Constants");
const MapObject_1 = require("./MapObject");
const floor = new MapObject_1.MapObject(-1000, 500, 2000 + Constants_1.MAP_OBJECT_STANDARD_FACTOR, Constants_1.MAP_OBJECT_STANDARD_FACTOR);
const leftWall = new MapObject_1.MapObject(-1000, -500, Constants_1.MAP_OBJECT_STANDARD_FACTOR, 1000);
const rightWall = new MapObject_1.MapObject(1000, -500, Constants_1.MAP_OBJECT_STANDARD_FACTOR, 1000);
const ceiling = new MapObject_1.MapObject(-1000, -500, 2000, Constants_1.MAP_OBJECT_STANDARD_FACTOR);
const middleObstacle = new MapObject_1.MapObject(-Constants_1.MAP_OBJECT_STANDARD_FACTOR / 2, 400, Constants_1.MAP_OBJECT_STANDARD_FACTOR, 100);
const getMap = () => {
    return [floor, leftWall, rightWall, ceiling, middleObstacle];
};
exports.getMap = getMap;
