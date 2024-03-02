import { Binary, defineSchema } from "nengi";
import { DynamicCollidable, CustomBox, CollidableType } from "./Collidable";
import { PLAYER_HEIGHT, PLAYER_MAX_HEALTH, PLAYER_WIDTH } from "./Constants";
import { NType } from "./ncontext";
import { rand } from "./Util";

type Position = { x: number; y: number };

export const entitySchema = defineSchema({
  // nid: Binary.UInt32 is already included by nengi
  // ntype: Binary.UInt8 is already included by nengi
  x: { type: Binary.Float64, interp: true },
  y: { type: Binary.Float64, interp: true },
  sx: { type: Binary.Float64, interp: true },
  sy: { type: Binary.Float64, interp: true },
  health: { type: Binary.Int16, interp: false },
});

/**
 * Defines a basic entity with a 2D position, we happen to name the class "Entity"
 * out of laziness, but this is not a nengi class -- it belongs to your game, call it
 * hero or goblin or whatever! :)
 */
export class Entity implements DynamicCollidable {
  nid = 0; // will be assigned by nengi, 0 is a placeholder
  ntype = NType.Entity;
  x = 0; // The raw x position of this entity
  y = 0; // The raw y position of this entity
  sx = 0; // The smoothed x position of this entity, for other clients to use visually and therfore the server to use for raycast checks
  sy = 0; // The smoothed y position of this entity, for other clients to use visually and therfore the server to use for raycast checks
  health = PLAYER_MAX_HEALTH;
  xPositions: number[] = []; // The historical x positions for this entity used for path following
  yPositions: number[] = []; // The historical y positions for this entity used for path following
  collidableType = CollidableType.Entity;
  collider: CustomBox;
  scollider: CustomBox;

  constructor(entity?: Entity) {
    if (entity) {
      this.nid = entity.nid;
      this.ntype = entity.ntype;
      this.x = entity.x;
      this.y = entity.y;
      this.sx = entity.sx;
      this.sy = entity.sy;
    }
    this.collider = new CustomBox(
      { x: this.x, y: this.y },
      PLAYER_WIDTH,
      PLAYER_HEIGHT,
      this.collidableType,
      {},
      this.nid
    );
    this.scollider = new CustomBox(
      { x: this.sx, y: this.sy },
      PLAYER_WIDTH,
      PLAYER_HEIGHT,
      this.collidableType,
      {},
      this.nid
    );
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

  takeDamage(damage: number) {
    this.health = this.health - damage < 0 ? 0 : this.health - damage;
    if (this.health === 0) {
      setTimeout(() => {
        this.respawn(rand(-400, 400), rand(0, 400));
      }, 2000);
    }
  }

  respawn(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sx = x;
    this.sy = y;

    setTimeout(() => {
      this.health = PLAYER_MAX_HEALTH;
    }, 1000);
  }
}
