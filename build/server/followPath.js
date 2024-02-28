"use strict";
// moves entity along path until out of movementBudget
// movementBudget is a distance of how far we can move in a single frame
Object.defineProperty(exports, "__esModule", { value: true });
exports.followPath = void 0;
const Constants_1 = require("../common/Constants");
const Util_1 = require("../common/Util");
const followPath = (entity, delta) => {
    let budget = Constants_1.ENTITY_SPEED_AND_GRAVITY * Constants_1.FOLLOW_BUDGET_FACTOR * delta;
    while (budget > 0 && entity.positions.length > 0) {
        const position = entity.positions[0];
        const { dist, dx, dy } = (0, Util_1.calculateDistance)(entity.sx, entity.sy, position.x, position.y);
        if (dist > Constants_1.MAX_FOLLOW_DISTANCE) {
            entity.sx = entity.x;
            entity.sy = entity.y;
        }
        else {
            if (budget >= dist) {
                budget -= dist;
                entity.sx = position.x;
                entity.sy = position.y;
                entity.positions.shift();
            }
            else if (budget < dist) {
                const ratio = budget / dist;
                budget = 0;
                entity.sx += dx * ratio;
                entity.sy += dy * ratio;
                entity.positions.unshift(position);
            }
        }
    }
};
exports.followPath = followPath;
