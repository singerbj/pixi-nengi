import { System, Response } from "detect-collisions";
import { Entity } from "./Entity";

class CollisionService {
  system = new System();

  insert(body: any) {
    this.system.insert(body);
  }

  remove(body: any) {
    this.system.remove(body);
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
}

export const collisionService = new CollisionService();
console.log("collisionService created!");
