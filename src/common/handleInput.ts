import { collisionService } from "./CollisionService";
import { ENTITY_SPEED_AND_GRAVITY, JUMP_TICKS } from "./Constants";
import { Entity } from "./Entity";
import { InputCommand } from "./InputCommand";
import { ShotMessage } from "./ShotMessage";

const jumpTicksTracker = new Map<number, number>();

export const handleInput = (
  entity: Entity,
  inputCommand: InputCommand
): [boolean, ShotMessage] => {
  const { up, left, right, delta, shooting, mouseX, mouseY } = inputCommand;

  // Calculate the movement vector based on the input
  const movementX = (right ? 1 : 0) - (left ? 1 : 0);

  // Normalize the movement vector
  const normalizedVector = {
    x: movementX !== 0 ? movementX / Math.sqrt(2) : 0,
    y: 0,
  };

  // set up the jump ticks tracker if we haven't already
  let jumpTicks = jumpTicksTracker.get(entity.nid);
  if (jumpTicks === undefined) {
    jumpTicks = 0;
    jumpTicksTracker.set(entity.nid, jumpTicks);
  }

  // check if jump was just pressed and we aren't already jumping
  if (up && jumpTicks === 0) {
    jumpTicksTracker.set(entity.nid, JUMP_TICKS * 2);
  }

  if (jumpTicks > 0) {
    normalizedVector.y = -((jumpTicks - JUMP_TICKS) / JUMP_TICKS);
    jumpTicksTracker.set(entity.nid, jumpTicks - 1);
  } else {
    normalizedVector.y = 1;
  }

  // Apply the movement with the same speed
  entity.x += ENTITY_SPEED_AND_GRAVITY * normalizedVector.x * delta;
  entity.y += ENTITY_SPEED_AND_GRAVITY * normalizedVector.y * delta;

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
