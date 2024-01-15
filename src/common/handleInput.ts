import { collisionService } from "./CollisionService";
import { ENTITY_SPEED, GRAVITY } from "./Constants";
import { Entity } from "./Entity";
import { InputCommand } from "./InputCommand";
import { ShotMessage } from "./ShotMessage";

// const jumpTicksTracker = new Map<number, number>();

export const handleInput = (
  entity: Entity,
  inputCommand: InputCommand
): [boolean, ShotMessage] => {
  const { up, down, left, right, delta, shooting, mouseX, mouseY } =
    inputCommand;

  // Calculate the movement vector based on the input
  const movementVector = {
    x: (right ? 1 : 0) - (left ? 1 : 0),
    y: (down ? 1 : 0) - (up ? 1 : 0),
  };

  // Normalize the movement vector
  const normalizedVector = {
    x: movementVector.x !== 0 ? movementVector.x / Math.sqrt(2) : 0,
    y: movementVector.y !== 0 ? movementVector.y / Math.sqrt(2) : 0,
  };

  // Apply the movement with the same speed
  entity.x += ENTITY_SPEED * normalizedVector.x * delta;
  entity.y += ENTITY_SPEED * normalizedVector.y * delta;

  // gravity
  entity.y += GRAVITY * delta;

  collisionService.resolveCollisionsForEntity(entity);

  return [
    shooting,
    new ShotMessage(
      entity.nid,
      entity.x,
      entity.y,
      mouseX,
      mouseY,
      false,
      0,
      0,
      0
    ),
  ];
};
