import { Binary, defineSchema } from "nengi";
import { Collidable, EntityBox, CollidableType } from "./Collidable";
import { PLAYER_HEIGHT, PLAYER_WIDTH } from "./Constants";
import { NType } from "./ncontext";

export const entitySchema = defineSchema({
  // nid: Binary.UInt32 is already included by nengi
  // ntype: Binary.UInt8 is already included by nengi
  x: { type: Binary.Float64, interp: true },
  y: { type: Binary.Float64, interp: true },
  // colliderX: { type: Binary.Float64, interp: false },
  // colliderY: { type: Binary.Float64, interp: false },
});

/**
 * Defines a basic entity with a 2D position, we happen to name the class "Entity"
 * out of laziness, but this is not a nengi class -- it belongs to your game, call it
 * hero or goblin or whatever! :)
 */
export class Entity implements Collidable {
  nid = 0; // will be assigned by nengi, 0 is a placeholder
  ntype = NType.Entity;
  x = 0;
  y = 0;
  type: CollidableType = "Entity";
  collider: EntityBox;

  constructor(entity?: Entity) {
    if (entity) {
      this.nid = entity.nid;
      this.ntype = entity.ntype;
      this.x = entity.x;
      this.y = entity.y;
    }
    this.collider = new EntityBox(
      { x: this.x, y: this.y },
      PLAYER_WIDTH,
      PLAYER_HEIGHT,
      {},
      {
        type: this.type,
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
