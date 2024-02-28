"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapObject = void 0;
const Collidable_1 = require("./Collidable");
// import { MAP_OBJECT_STANDARD_FACTOR } from "../common/Constants";
class MapObject {
    constructor(x, y, width, height) {
        // const width = widthTiles * MAP_OBJECT_STANDARD_FACTOR;
        // const height = heightTiles * MAP_OBJECT_STANDARD_FACTOR;
        this.collidableType = "MapObject";
        this.colliderOptions = {
            isStatic: true,
        };
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.collider = new Collidable_1.CustomBox({ x, y }, width, height, "MapObject", this.colliderOptions);
        this.scollider = new Collidable_1.CustomBox({ x, y }, width, height, "MapObject", this.colliderOptions);
    }
}
exports.MapObject = MapObject;
