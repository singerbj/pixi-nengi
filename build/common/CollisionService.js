"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collisionService = void 0;
const detect_collisions_1 = require("detect-collisions");
const Collidable_1 = require("./Collidable");
const Constants_1 = require("./Constants");
const MapService_1 = require("./MapService");
class CollisionService {
    constructor() {
        this.system = new detect_collisions_1.System();
        this.ssystem = new detect_collisions_1.System();
    }
    insert(entity) {
        this.system.insert(entity.collider);
        this.ssystem.insert(entity.scollider);
    }
    remove(entity) {
        this.system.remove(entity.collider);
        this.ssystem.remove(entity.scollider);
    }
    getHistoricalSystem(pastEntityState) {
        const historicalSystem = new detect_collisions_1.System();
        pastEntityState.forEach((entity) => {
            historicalSystem.insert(new Collidable_1.CustomBox({ x: entity.sx, y: entity.sy }, Constants_1.PLAYER_WIDTH, Constants_1.PLAYER_HEIGHT, "Entity", //TODO: find a better way of referencing this stuff
            undefined, entity.nid));
        });
        (0, MapService_1.getMap)().forEach((mapObject) => historicalSystem.insert(new Collidable_1.CustomBox({ x: mapObject.x, y: mapObject.y }, mapObject.width, mapObject.height, mapObject.collidableType, mapObject.colliderOptions)));
        return historicalSystem;
    }
    resolveCollisionsForEntity(entity) {
        entity.updateColliderFromPosition();
        this.system.checkOne(entity.collider, (response) => {
            const { overlapV } = response;
            response.a.setPosition(response.a.x - overlapV.x, response.a.y - overlapV.y);
            response.a.updateBody();
            entity.updatePositionFromCollider();
        });
    }
    registerMap(mapObjects) {
        mapObjects.forEach((mapObject) => {
            this.system.insert(mapObject.collider);
            this.ssystem.insert(mapObject.scollider);
        });
    }
    entityIsOnLeftWall(entity, system) {
        return this.entityIsOnWall(entity, system, 0, 1);
    }
    entityIsOnRightWall(entity, system) {
        return this.entityIsOnWall(entity, system, Constants_1.PLAYER_WIDTH, -1);
    }
    entityIsOnWall(entity, system, xOffset = 0, directionMultiplier) {
        //@ts-ignore //TODO: fix this somehow
        const hitTopLeft = system.raycast({
            x: entity.collider.x +
                xOffset +
                directionMultiplier * Constants_1.WALL_CHECK_RAYCAST_LENGTH,
            y: entity.collider.y + Constants_1.WALL_CHECK_RAYCAST_LENGTH,
        }, {
            x: entity.collider.x +
                xOffset -
                directionMultiplier * Constants_1.WALL_CHECK_RAYCAST_LENGTH,
            y: entity.collider.y + Constants_1.WALL_CHECK_RAYCAST_LENGTH,
        }, (body) => {
            return (body.nid === undefined || (body.nid !== entity.nid && body.nid !== 0));
        });
        //@ts-ignore //TODO: fix this somehow
        const hitBottomLeft = system.raycast({
            x: entity.collider.x +
                xOffset +
                directionMultiplier * Constants_1.WALL_CHECK_RAYCAST_LENGTH,
            y: entity.collider.y + Constants_1.PLAYER_HEIGHT - Constants_1.WALL_CHECK_RAYCAST_LENGTH,
        }, {
            x: entity.collider.x +
                xOffset -
                directionMultiplier * Constants_1.WALL_CHECK_RAYCAST_LENGTH,
            y: entity.collider.y + Constants_1.PLAYER_HEIGHT - Constants_1.WALL_CHECK_RAYCAST_LENGTH,
        }, (body) => {
            return (body.nid === undefined || (body.nid !== entity.nid && body.nid !== 0));
        });
        return !!(hitTopLeft || hitBottomLeft);
    }
    entityIsOnGround(entity, system) {
        //@ts-ignore //TODO: fix this somehow
        const hitLeft = system.raycast({
            x: entity.collider.x + Constants_1.JUMP_CHECK_RAYCAST_X_OFFSET,
            y: entity.collider.y + Constants_1.PLAYER_HEIGHT,
        }, {
            x: entity.collider.x + Constants_1.JUMP_CHECK_RAYCAST_X_OFFSET,
            y: entity.collider.y + Constants_1.PLAYER_HEIGHT + Constants_1.JUMP_CHECK_RAYCAST_LENGTH,
        }, (body) => {
            return (body.nid === undefined || (body.nid !== entity.nid && body.nid !== 0));
        });
        //@ts-expect-error //TODO: fix this somehow
        const hitRight = system.raycast({
            x: entity.collider.x + Constants_1.PLAYER_WIDTH - Constants_1.JUMP_CHECK_RAYCAST_X_OFFSET,
            y: entity.collider.y + Constants_1.PLAYER_HEIGHT,
        }, {
            x: entity.collider.x + Constants_1.PLAYER_WIDTH - Constants_1.JUMP_CHECK_RAYCAST_X_OFFSET,
            y: entity.collider.y + Constants_1.PLAYER_HEIGHT + Constants_1.JUMP_CHECK_RAYCAST_LENGTH,
        }, (body) => {
            return (body.nid === undefined || (body.nid !== entity.nid && body.nid !== 0));
        });
        return !!(hitLeft || hitRight);
    }
}
exports.collisionService = new CollisionService();
console.log("collisionService created!");
