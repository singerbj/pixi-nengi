import { System, Response } from "detect-collisions";
import { Entity } from "./Entity";
import { MapObject } from "./MapObject";
import { CustomBox } from "./Collidable";
import { PLAYER_HEIGHT, PLAYER_WIDTH } from "./Constants";
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

  // cloneSystem(system: System) {
  //   const clone = Object.assign(
  //     Object.create(Object.getPrototypeOf(system)),
  //     system
  //   );
  //   // return new System().fromJSON(this.system.toJSON());
  //   // return structuredClone(this.system);
  //   // return new System().fromJSON(structuredClone(this.system.toJSON()));
  //   // return this.system.toJSON();
  //   return clone;
  // }

  // getCopyOfSystem() {
  //   return this.cloneSystem(this.system);
  // }

  // getCopyOfSoftSystem() {
  //   return this.cloneSystem(this.ssystem);
  // }

  // resolveAllCollisions() {
  //   this.system.checkAll((response: Response) => {
  //     if (
  //       response.a.customOptions.type === "Entity" &&
  //       response.b.customOptions.type === "Entity"
  //     ) {
  //       const { overlapV } = response;
  //       response.a.setPosition(
  //         response.a.x - overlapV.x,
  //         response.a.y - overlapV.y
  //       );
  //     }
  //   });
  // }

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
}

export const collisionService = new CollisionService();
console.log("collisionService created!");
