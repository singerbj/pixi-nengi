import { collisionService } from "./CollisionService";
import { ENTITY_SPEED, GRAVITY } from "./Constants";
import { Entity } from "./Entity";
import { InputCommand } from "./InputCommand";

export const handleInput = (entity: Entity, inputCommand: InputCommand) => {
  // the correct version of this is a NORMALIZED VECTOR * delta
  // this math is incorrect

  const { up, down, left, right, delta } = inputCommand;
  if (up) {
    entity.y -= ENTITY_SPEED * delta;
  }
  if (down) {
    entity.y += ENTITY_SPEED * delta;
  }
  if (left) {
    entity.x -= ENTITY_SPEED * delta;
  }
  if (right) {
    entity.x += ENTITY_SPEED * delta;
  }

  // gravity
  entity.y += GRAVITY * delta;

  collisionService.resolveCollisionsForEntity(entity);
};
