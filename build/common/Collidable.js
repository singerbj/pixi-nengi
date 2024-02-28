"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomBox = exports.isCollidableType = exports.possibleCollideableTypes = void 0;
const detect_collisions_1 = require("detect-collisions");
exports.possibleCollideableTypes = ["Entity", "MapObject"];
const isCollidableType = (maybeCollidableType) => {
    const collidableType = exports.possibleCollideableTypes.find((validCollidableType) => validCollidableType === maybeCollidableType);
    if (collidableType) {
        return collidableType;
    }
    else {
        throw new Error("That is not a valid CollidableType: " + maybeCollidableType);
    }
};
exports.isCollidableType = isCollidableType;
class CustomBox extends detect_collisions_1.Box {
    constructor(position, width, height, collidableType, options, nid) {
        super(position, width, height, options);
        this.collidableType = collidableType;
        this.nid = nid;
    }
}
exports.CustomBox = CustomBox;
