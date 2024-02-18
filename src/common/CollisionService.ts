import { System, Response } from "detect-collisions";
import { Entity } from "./Entity";
import { MapObject } from "./MapObject";

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

  getCopyOfSystem() {
    // return Object.assign(
    //   Object.create(Object.getPrototypeOf(this.system)),
    //   this.system
    // );
    return new System().fromJSON(this.system.toJSON());
    // return structuredClone(this.system);
    // return new System().fromJSON(structuredClone(this.system.toJSON()));
    // return this.system.toJSON();
  }

  getCopyOfSoftSystem() {
    // return Object.assign(
    //   Object.create(Object.getPrototypeOf(this.ssystem)),
    //   this.ssystem
    // );
    return new System().fromJSON(this.ssystem.toJSON());
    // return structuredClone(this.ssystem);
    // return new System().fromJSON(structuredClone(this.ssystem.toJSON()));
    // return this.ssystem.toJSON();
  }

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
