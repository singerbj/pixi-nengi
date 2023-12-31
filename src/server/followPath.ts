// moves entity along path until out of movementBudget
// movementBudget is a distance of how far we can move in a single frame

import { ENTITY_SPEED, FOLLOW_BUDGET_FACTOR } from "../common/Constants";
import { Entity } from "../common/Entity";
import { calculateDistance } from "../common/Util";

export const followPath = (entity: Entity, delta: number) => {
  let budget = ENTITY_SPEED * FOLLOW_BUDGET_FACTOR * delta;
  while (budget > 0 && entity.positions.length > 0) {
    const position = entity.positions[0];

    const { dist, dx, dy } = calculateDistance(
      entity.sx,
      entity.sy,
      position.x,
      position.y
    );

    if (budget >= dist) {
      budget -= dist;
      entity.sx = position.x;
      entity.sy = position.y;
      entity.positions.shift();
    } else if (budget < dist) {
      const ratio = budget / dist;
      budget = 0;
      entity.sx += dx * ratio;
      entity.sy += dy * ratio;
      entity.positions.unshift(position);
    }
  }
};
