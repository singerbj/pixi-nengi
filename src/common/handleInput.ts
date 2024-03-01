import { collisionService } from "./CollisionService";
import {
  ENTITY_SPEED,
  ENTITY_JUMP_SPEED_AND_GRAVITY,
  LAST_JUMP_DELAY,
  X_JUMP_TICKS,
  Y_JUMP_TICKS,
} from "./Constants";
import { Entity } from "./Entity";
import { InputCommand } from "./InputCommand";
import { ShotMessage } from "./ShotMessage";

export enum JumpType {
  Ground,
  LeftWall,
  RightWall,
}

const xJumpTicksTracker = new Map<number, number>();
const yJumpTicksTracker = new Map<number, number>();
const lastJumpTicksTracker = new Map<number, number>();
const lastJumpTypeTracker = new Map<number, JumpType>();

export const handleInput = (
  entity: Entity,
  inputCommand: InputCommand
): [boolean, ShotMessage] => {
  const { upJustPressed, left, right, delta, shooting, mouseX, mouseY } =
    inputCommand;

  // Normalize the movement vector
  const normalizedVector = {
    x: 0,
    y: 0,
  };

  // Set up the jump ticks trackers if we haven't already
  let xJumpTicks = xJumpTicksTracker.get(entity.nid);
  let yJumpTicks = yJumpTicksTracker.get(entity.nid);
  let lastJumpTicks = lastJumpTicksTracker.get(entity.nid);
  if (xJumpTicks === undefined) {
    xJumpTicks = 0;
    xJumpTicksTracker.set(entity.nid, xJumpTicks);
  }
  if (yJumpTicks === undefined) {
    yJumpTicks = 0;
    yJumpTicksTracker.set(entity.nid, yJumpTicks);
  }
  if (lastJumpTicks === undefined) {
    lastJumpTicks = 0;
    lastJumpTicksTracker.set(entity.nid, lastJumpTicks);
  }

  // do raycasts to check if we are on the ground or a wall
  const isOnGround = collisionService.entityIsOnGround(
    entity,
    collisionService.ssystem
  );
  const isOnLeftWall = collisionService.entityIsOnLeftWall(
    entity,
    collisionService.ssystem
  );
  const isOnRightWall = collisionService.entityIsOnRightWall(
    entity,
    collisionService.ssystem
  );

  // determine if we can jump again after a previous jump
  const canJumpAgain =
    lastJumpTicks <= 0 &&
    xJumpTicks < LAST_JUMP_DELAY &&
    (isOnLeftWall || isOnRightWall) &&
    // yJumpTicks >= Y_JUMP_TICKS - Y_JUMP_TICKS / 4 &&
    lastJumpTypeTracker.get(entity.nid) !==
      (isOnLeftWall ? JumpType.LeftWall : JumpType.RightWall);

  // if we are on the ground
  if (isOnGround) {
    // if jump was just pressed
    if (upJustPressed && lastJumpTicks <= 0) {
      // do a regular jump
      yJumpTicks = Y_JUMP_TICKS * 2;
      yJumpTicksTracker.set(entity.nid, yJumpTicks);
      lastJumpTicksTracker.set(entity.nid, LAST_JUMP_DELAY);
      lastJumpTypeTracker.set(entity.nid, JumpType.Ground);
    } else {
      // otherwise fall at the speed we would when jumping, even though we did't jump
      yJumpTicks = Y_JUMP_TICKS;
      yJumpTicksTracker.set(entity.nid, yJumpTicks);
    }
    // if we are not on the ground, check if we should do a wall jump
  } else {
    // if we are on a wall
    if (isOnLeftWall || isOnRightWall) {
      // if the up key is pressed and we are able to jump again
      if (upJustPressed && canJumpAgain) {
        // do a wall jump
        xJumpTicks = isOnLeftWall ? X_JUMP_TICKS * 2 : -X_JUMP_TICKS * 2;
        xJumpTicksTracker.set(entity.nid, yJumpTicks);
        yJumpTicks = Y_JUMP_TICKS * 2;
        yJumpTicksTracker.set(entity.nid, yJumpTicks);
        lastJumpTicks = LAST_JUMP_DELAY;
        lastJumpTicksTracker.set(entity.nid, LAST_JUMP_DELAY);
        lastJumpTypeTracker.set(
          entity.nid,
          isOnLeftWall ? JumpType.LeftWall : JumpType.RightWall
        );
      }
    }
  }

  // Set our normalized x vector initially based on input
  normalizedVector.x = (right ? 1 : 0) - (left ? 1 : 0);

  // update the x value of our normalized vector based on our progress horizontally in a wall jump
  if (xJumpTicks > 0) {
    normalizedVector.x += 0.5;
    xJumpTicks -= 1 * delta;
    xJumpTicksTracker.set(entity.nid, xJumpTicks);
  } else if (xJumpTicks < 0) {
    normalizedVector.x -= 0.5;
    xJumpTicks += 1 * delta;
    xJumpTicksTracker.set(entity.nid, xJumpTicks);
  }

  // update the y value of our normalized vector based on our progress in a jump vertically
  if (yJumpTicks > 0) {
    normalizedVector.y = -((yJumpTicks - Y_JUMP_TICKS) / Y_JUMP_TICKS);
    yJumpTicks -= 1 * delta;
    yJumpTicksTracker.set(entity.nid, yJumpTicks);
  } else {
    normalizedVector.y = 1;
  }

  // Deduct our last jump tracker
  if (lastJumpTicks > 0) {
    lastJumpTicks -= 1 * delta;
    lastJumpTicksTracker.set(entity.nid, lastJumpTicks);
  }

  // clamp the normalized vectors to max speeds
  normalizedVector.x =
    normalizedVector.x !== 0 ? normalizedVector.x / Math.sqrt(2) : 0;
  normalizedVector.y =
    normalizedVector.y !== 0 ? normalizedVector.y / Math.sqrt(2) : 0;

  // Apply the movement with the same speed
  entity.x += ENTITY_SPEED * normalizedVector.x * delta;
  entity.y += ENTITY_JUMP_SPEED_AND_GRAVITY * normalizedVector.y * delta;

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
