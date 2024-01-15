import { Binary, defineSchema } from "nengi";
import { DynamicCollidable, CustomBox, CollidableType } from "./Collidable";
import { PLAYER_HEIGHT, PLAYER_WIDTH } from "./Constants";
import { NType } from "./ncontext";

type Position = { x: number; y: number };

export const entitySchema = defineSchema({
  // nid: Binary.UInt32 is already included by nengi
  // ntype: Binary.UInt8 is already included by nengi
  x: { type: Binary.Float64, interp: true },
  y: { type: Binary.Float64, interp: true },
  sx: { type: Binary.Float64, interp: true },
  sy: { type: Binary.Float64, interp: true },
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
  positions: Position[] = []; // The historical positions for this entity used for path following
  type: CollidableType = "Entity";
  collider: CustomBox;

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
      { x: entity ? this.x : this.sx, y: entity ? this.y : this.sy },
      PLAYER_WIDTH,
      PLAYER_HEIGHT,
      {},
      {
        type: this.type,
        nid: this.nid,
      }
    );
  }

  updateColliderFromPosition() {
    this.collider.setPosition(this.x, this.y);
    this.collider.updateBody();
  }

  updatePositionFromCollider() {
    this.x = this.collider.pos.x;
    this.y = this.collider.pos.y;
  }
}
