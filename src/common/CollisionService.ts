import { System, Response, RaycastHit } from "detect-collisions";
import { Entity } from "./Entity";
import { MapObject } from "./MapObject";
import { CustomBox } from "./Collidable";
import {
  JUMP_CHECK_RAYCAST_LENGTH,
  JUMP_CHECK_RAYCAST_X_OFFSET,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  WALL_CHECK_RAYCAST_LENGTH,
  WALL_CHECK_RAYCAST_Y_OFFSET,
} from "./Constants";
import { getMap } from "./MapService";
import { HistorySnapshot, IEntity } from "nengi";

class CollisionService {
  system = new System();
  ssystem = new System();

  insert(entity: Entity) {
    this.system.insert(entity.collider);
    this.ssystem.insert(entity.scollider);
  }

  remove(entity: Entity) {
    this.system.remove(entity.collider);
    this.ssystem.remove(entity.scollider);
  }

  getHistoricalSystem(pastEntityState: HistorySnapshot): System {
    const historicalSystem = new System();
    pastEntityState.forEach((entity: IEntity) => {
      historicalSystem.insert(
        new CustomBox(
          { x: entity.sx, y: entity.sy },
          PLAYER_WIDTH,
          PLAYER_HEIGHT,
          "Entity", //TODO: find a better way of referencing this stuff
          undefined,
          entity.nid
        )
      );
    });
    getMap().forEach((mapObject: MapObject) =>
      historicalSystem.insert(
        new CustomBox(
          { x: mapObject.x, y: mapObject.y },
          mapObject.width,
          mapObject.height,
          mapObject.collidableType,
          mapObject.colliderOptions
        )
      )
    );
    return historicalSystem;
  }

  resolveCollisionsForEntity(entity: Entity) {
    entity.updateColliderFromPosition();

    this.system.checkOne(entity.collider, (response: Response) => {
      const { overlapV } = response;

      response.a.setPosition(
        response.a.x - overlapV.x,
        response.a.y - overlapV.y
      );
      response.a.updateBody();
      entity.updatePositionFromCollider();
    });
  }

  registerMap(mapObjects: MapObject[]) {
    mapObjects.forEach((mapObject) => {
      this.system.insert(mapObject.collider);
      this.ssystem.insert(mapObject.scollider);
    });
  }

  entityIsOnLeftWall(entity: Entity, system: System) {
    return this.entityIsOnWall(entity, system, 0, 1);
  }

  entityIsOnRightWall(entity: Entity, system: System) {
    return this.entityIsOnWall(entity, system, PLAYER_WIDTH, -1);
  }

  private entityIsOnWall(
    entity: Entity,
    system: System,
    xOffset = 0,
    directionMultiplier: 1 | -1
  ): boolean {
    //@ts-ignore //TODO: fix this somehow
    const hitTopLeft: RaycastHit<Body> | null = system.raycast(
      {
        x:
          entity.collider.x +
          xOffset +
          directionMultiplier * WALL_CHECK_RAYCAST_LENGTH,
        y: entity.collider.y + WALL_CHECK_RAYCAST_LENGTH,
      },
      {
        x:
          entity.collider.x +
          xOffset -
          directionMultiplier * WALL_CHECK_RAYCAST_LENGTH,
        y: entity.collider.y + WALL_CHECK_RAYCAST_LENGTH,
      },
      (body: any): boolean => {
        return (
          body.nid === undefined || (body.nid !== entity.nid && body.nid !== 0)
        );
      }
    );
    //@ts-ignore //TODO: fix this somehow
    const hitBottomLeft: RaycastHit<Body> | null = system.raycast(
      {
        x:
          entity.collider.x +
          xOffset +
          directionMultiplier * WALL_CHECK_RAYCAST_LENGTH,
        y: entity.collider.y + PLAYER_HEIGHT - WALL_CHECK_RAYCAST_LENGTH,
      },
      {
        x:
          entity.collider.x +
          xOffset -
          directionMultiplier * WALL_CHECK_RAYCAST_LENGTH,
        y: entity.collider.y + PLAYER_HEIGHT - WALL_CHECK_RAYCAST_LENGTH,
      },
      (body: any): boolean => {
        return (
          body.nid === undefined || (body.nid !== entity.nid && body.nid !== 0)
        );
      }
    );

    return !!(hitTopLeft || hitBottomLeft);
  }

  entityIsOnGround(entity: Entity, system: System): boolean {
    //@ts-ignore //TODO: fix this somehow
    const hitLeft: RaycastHit<Body> | null = system.raycast(
      {
        x: entity.collider.x + JUMP_CHECK_RAYCAST_X_OFFSET,
        y: entity.collider.y + PLAYER_HEIGHT,
      },
      {
        x: entity.collider.x + JUMP_CHECK_RAYCAST_X_OFFSET,
        y: entity.collider.y + PLAYER_HEIGHT + JUMP_CHECK_RAYCAST_LENGTH,
      },
      (body: any): boolean => {
        return (
          body.nid === undefined || (body.nid !== entity.nid && body.nid !== 0)
        );
      }
    );
    //@ts-expect-error //TODO: fix this somehow
    const hitRight: RaycastHit<Body> | null = system.raycast(
      {
        x: entity.collider.x + PLAYER_WIDTH - JUMP_CHECK_RAYCAST_X_OFFSET,
        y: entity.collider.y + PLAYER_HEIGHT,
      },
      {
        x: entity.collider.x + PLAYER_WIDTH - JUMP_CHECK_RAYCAST_X_OFFSET,
        y: entity.collider.y + PLAYER_HEIGHT + JUMP_CHECK_RAYCAST_LENGTH,
      },
      (body: any): boolean => {
        return (
          body.nid === undefined || (body.nid !== entity.nid && body.nid !== 0)
        );
      }
    );

    return !!(hitLeft || hitRight);
  }
}

export const collisionService = new CollisionService();
console.log("collisionService created!");
