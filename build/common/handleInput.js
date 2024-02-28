"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleInput = void 0;
const CollisionService_1 = require("./CollisionService");
const Constants_1 = require("./Constants");
const ShotMessage_1 = require("./ShotMessage");
const Util_1 = require("./Util");
const xJumpTicksTracker = new Map();
const yJumpTicksTracker = new Map();
const lastJumpTracker = new Map();
const handleInput = (entity, inputCommand) => {
    const { up, left, right, delta, shooting, mouseX, mouseY } = inputCommand;
    // Calculate the movement vector based on the input
    const movementX = (right ? 1 : 0) - (left ? 1 : 0);
    // Normalize the movement vector
    const normalizedVector = {
        x: movementX !== 0 ? movementX / Math.sqrt(2) : 0,
        y: 0,
    };
    // Set up the jump ticks trackers if we haven't already
    let xJumpTicks = xJumpTicksTracker.get(entity.nid);
    let yJumpTicks = yJumpTicksTracker.get(entity.nid);
    let lastJumpTicks = lastJumpTracker.get(entity.nid);
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
        lastJumpTracker.set(entity.nid, lastJumpTicks);
    }
    // do raycasts to check if we are on the ground or a wall
    const isOnGround = CollisionService_1.collisionService.entityIsOnGround(entity, CollisionService_1.collisionService.ssystem);
    const isOnLeftWall = CollisionService_1.collisionService.entityIsOnLeftWall(entity, CollisionService_1.collisionService.ssystem);
    const isOnRightWall = CollisionService_1.collisionService.entityIsOnRightWall(entity, CollisionService_1.collisionService.ssystem);
    // determine if we can jump again after a previous jump
    const canJumpAgain = lastJumpTicks === 0 &&
        xJumpTicks === 0 &&
        (isOnLeftWall || isOnRightWall) &&
        yJumpTicks >= Constants_1.Y_JUMP_TICKS - Constants_1.Y_JUMP_TICKS / 2;
    // if we are on the ground
    if (isOnGround) {
        // if jump was just pressed
        if (up && lastJumpTicks === 0) {
            // do a regular jump
            yJumpTicks = Constants_1.Y_JUMP_TICKS * 2;
            yJumpTicksTracker.set(entity.nid, yJumpTicks);
            lastJumpTracker.set(entity.nid, Constants_1.LAST_JUMP_DELAY);
        }
        else {
            // otherwise fall at the speed we would when jumping, even though we did't jump
            yJumpTicks = Constants_1.Y_JUMP_TICKS;
            yJumpTicksTracker.set(entity.nid, yJumpTicks);
        }
        // if we are not on the ground, check if we should do a wall jump
    }
    else {
        // if we are on a wall
        if (isOnLeftWall || isOnRightWall) {
            // if the up key is pressed and we are able to jump again
            if (up && canJumpAgain) {
                // do a wall jump
                xJumpTicks = isOnLeftWall ? Constants_1.X_JUMP_TICKS * 2 : -Constants_1.X_JUMP_TICKS * 2;
                xJumpTicksTracker.set(entity.nid, yJumpTicks);
                yJumpTicks = Constants_1.Y_JUMP_TICKS * 2;
                yJumpTicksTracker.set(entity.nid, yJumpTicks);
                lastJumpTicks = Constants_1.LAST_JUMP_DELAY;
                lastJumpTracker.set(entity.nid, Constants_1.LAST_JUMP_DELAY);
            }
        }
    }
    // update the x value of our normalized vector based on our progress horizontally in a wall jump
    if (xJumpTicks > 0) {
        normalizedVector.x += 0.5;
        xJumpTicks -= 1;
        xJumpTicksTracker.set(entity.nid, xJumpTicks);
    }
    else if (xJumpTicks < 0) {
        normalizedVector.x -= 0.5;
        xJumpTicks += 1;
        xJumpTicksTracker.set(entity.nid, xJumpTicks);
    }
    else {
        normalizedVector.x = movementX !== 0 ? movementX / Math.sqrt(2) : 0;
    }
    // update the y value of our normalized vector based on our progress in a jump vertically
    if (yJumpTicks > 0) {
        normalizedVector.y = -((yJumpTicks - Constants_1.Y_JUMP_TICKS) / Constants_1.Y_JUMP_TICKS);
        yJumpTicks -= 1;
        yJumpTicksTracker.set(entity.nid, yJumpTicks);
    }
    else {
        normalizedVector.y = 1;
    }
    // Deduct our last jump tracker
    if (lastJumpTicks > 0) {
        lastJumpTicks -= 1;
        lastJumpTracker.set(entity.nid, lastJumpTicks);
    }
    // Make sure our max x move speed is 1 in either direction
    normalizedVector.x = (0, Util_1.clamp)(normalizedVector.x, -1, 1);
    // Apply the movement with the same speed
    entity.x += Constants_1.ENTITY_SPEED_AND_GRAVITY * normalizedVector.x * delta;
    entity.y += Constants_1.ENTITY_SPEED_AND_GRAVITY * normalizedVector.y * delta;
    CollisionService_1.collisionService.resolveCollisionsForEntity(entity);
    return [
        shooting,
        new ShotMessage_1.ShotMessage(entity.nid, entity.x, entity.y, mouseX, mouseY, false, 0, 0, 0),
    ];
};
exports.handleInput = handleInput;
