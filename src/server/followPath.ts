// moves entity along path until out of movementBudget
// movementBudget is a distance of how far we can move in a single frame

import {
  ENTITY_SPEED,
  ENTITY_JUMP_SPEED_AND_GRAVITY,
  FOLLOW_X_BUDGET_FACTOR,
  FOLLOW_Y_BUDGET_FACTOR,
  MAX_FOLLOW_DISTANCE,
} from "../common/Constants";
import { Entity } from "../common/Entity";

export const followPath = (entity: Entity, delta: number) => {
  let xBudget = ENTITY_SPEED * FOLLOW_X_BUDGET_FACTOR * delta;
  while (xBudget > 0 && entity.xPositions.length > 0) {
    const xPosition = entity.xPositions[0];
    const dx = xPosition - entity.sx;

    if (dx > MAX_FOLLOW_DISTANCE) {
      entity.sx = entity.x;
      entity.xPositions.shift();
    } else {
      if (xBudget >= dx) {
        xBudget -= dx;
        entity.sx = xPosition;
        entity.xPositions.shift();
      } else if (xBudget < dx) {
        const ratio = xBudget / dx;
        xBudget = 0;
        entity.sx += dx * ratio;
        entity.xPositions.unshift(xPosition);
      }
    }
  }

  let yBudget = ENTITY_JUMP_SPEED_AND_GRAVITY * FOLLOW_Y_BUDGET_FACTOR * delta;
  while (yBudget > 0 && entity.yPositions.length > 0) {
    const yPosition = entity.yPositions[0];
    const dy = yPosition - entity.sy;

    if (dy > MAX_FOLLOW_DISTANCE) {
      entity.sy = entity.y;
      entity.yPositions.shift();
    } else {
      if (yBudget >= dy) {
        yBudget -= dy;
        entity.sy = yPosition;
        entity.yPositions.shift();
      } else if (yBudget < dy) {
        const ratio = yBudget / dy;
        yBudget = 0;
        entity.sy += dy * ratio;
        entity.yPositions.unshift(yPosition);
      }
    }
  }
};
