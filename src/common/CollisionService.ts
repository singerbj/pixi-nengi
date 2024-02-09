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
    const systemCopy = Object.assign(
      Object.create(Object.getPrototypeOf(this.system)),
      this.system
    );
    return systemCopy;
    // return new System().fromJSON(this.system.toJSON());
  }

  getCopyOfSoftSystem() {
    const ssystemCopy = Object.assign(
      Object.create(Object.getPrototypeOf(this.ssystem)),
      this.ssystem
    );
    return ssystemCopy;
    // return new System().fromJSON(this.system.toJSON());
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
      this.ssystem.insert(mapObject.collider);
    });
  }
}

export const collisionService = new CollisionService();
console.log("collisionService created!");
