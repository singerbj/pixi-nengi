"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = exports.entitySchema = void 0;
const nengi_1 = require("nengi");
const Collidable_1 = require("./Collidable");
const Constants_1 = require("./Constants");
const ncontext_1 = require("./ncontext");
exports.entitySchema = (0, nengi_1.defineSchema)({
    // nid: Binary.UInt32 is already included by nengi
    // ntype: Binary.UInt8 is already included by nengi
    x: { type: nengi_1.Binary.Float64, interp: true },
    y: { type: nengi_1.Binary.Float64, interp: true },
    sx: { type: nengi_1.Binary.Float64, interp: true },
    sy: { type: nengi_1.Binary.Float64, interp: true },
});
/**
 * Defines a basic entity with a 2D position, we happen to name the class "Entity"
 * out of laziness, but this is not a nengi class -- it belongs to your game, call it
 * hero or goblin or whatever! :)
 */
class Entity {
    constructor(entity) {
        this.nid = 0; // will be assigned by nengi, 0 is a placeholder
        this.ntype = ncontext_1.NType.Entity;
        this.x = 0; // The raw x position of this entity
        this.y = 0; // The raw y position of this entity
        this.sx = 0; // The smoothed x position of this entity, for other clients to use visually and therfore the server to use for raycast checks
        this.sy = 0; // The smoothed y position of this entity, for other clients to use visually and therfore the server to use for raycast checks
        this.positions = []; // The historical positions for this entity used for path following
        this.collidableType = "Entity";
        if (entity) {
            this.nid = entity.nid;
            this.ntype = entity.ntype;
            this.x = entity.x;
            this.y = entity.y;
            this.sx = entity.sx;
            this.sy = entity.sy;
        }
        this.collider = new Collidable_1.CustomBox({ x: this.x, y: this.y }, Constants_1.PLAYER_WIDTH, Constants_1.PLAYER_HEIGHT, this.collidableType, {}, this.nid);
        this.scollider = new Collidable_1.CustomBox({ x: this.sx, y: this.sy }, Constants_1.PLAYER_WIDTH, Constants_1.PLAYER_HEIGHT, this.collidableType, {}, this.nid);
    }
    updateColliderCustomOptions() {
        if (this.collider.nid === undefined) {
            this.collider.nid = this.nid;
        }
        if (this.scollider.nid === undefined) {
            this.scollider.nid = this.nid;
        }
    }
    updateColliderFromPosition() {
        this.collider.setPosition(this.x, this.y);
        this.collider.updateBody();
        this.scollider.setPosition(this.sx, this.sy);
        this.scollider.updateBody();
    }
    updatePositionFromCollider() {
        this.x = this.collider.pos.x;
        this.y = this.collider.pos.y;
        this.sx = this.scollider.pos.x;
        this.sy = this.scollider.pos.y;
    }
}
exports.Entity = Entity;
