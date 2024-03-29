import { RaycastHit, System } from "detect-collisions";
import { ShotMessage } from "../common/ShotMessage";
import { getNewPointOnLineWithDistance } from "../common/Util";
import { SHOT_DISTANCE } from "../common/Constants";
import { Historian } from "nengi";
import { collisionService } from "../common/CollisionService";
import { Entity } from "../common/Entity";
import { CollidableType } from "../common/Collidable";

export const lagCompensatedHitscanCheck = (
  historian: Historian,
  shooterId: number,
  entities: Map<number, Entity>,
  timeAgo: number,
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  ignoreNids: number[] = []
): ShotMessage => {
  // Get the actual shot coordinates based on the shot distance and the user input
  const [newTargetX, newTargetY] = getNewPointOnLineWithDistance(
    // fix for NaN issue
    originX === targetX ? originX + 0.000001 : originX,
    originY,
    targetX,
    targetY,
    SHOT_DISTANCE
  );

  const pastEntityState = historian.getFastLagCompensatedState(timeAgo);
  if (pastEntityState) {
    const historicalSystem =
      collisionService.getHistoricalSystem(pastEntityState);

    //TODO: fix this somehow
    //@ts-expect-error
    const hit: RaycastHit<Body> | null = historicalSystem.raycast(
      { x: originX, y: originY },
      { x: newTargetX, y: newTargetY },
      (body: any): boolean => {
        //TODO: fix this somehow
        //@ts-ignore
        const nid = body.nid;
        const health = entities.get(nid)?.health;
        const collidableType = body.collidableType;
        return (
          collidableType === CollidableType.MapObject ||
          (!ignoreNids.includes(nid) && health !== undefined && health > 0)
        );
      }
    );

    if (hit !== null) {
      // TODO: fix this
      //@ts-expect-error
      const nid = hit.body.nid;
      const hitEntity: Entity | undefined = entities.get(nid);

      if (hitEntity) {
        hitEntity.takeDamage(3);
      }
      return new ShotMessage(
        shooterId,
        originX,
        originY,
        newTargetX,
        newTargetY,
        true,
        hit.point.x,
        hit.point.y,
        // TODO: fix this
        //@ts-ignore
        hit.body.nid || 0
      );
    } else {
      return new ShotMessage(
        shooterId,
        originX,
        originY,
        newTargetX,
        newTargetY,
        false,
        0,
        0,
        0
      );
    }
  } else {
    console.error(
      `Not enough historical frames to do hit detection! (timeAgo=${timeAgo})`
    );
    return new ShotMessage(
      shooterId,
      originX,
      originY,
      newTargetX,
      newTargetY,
      false,
      0,
      0,
      0
    );
  }
};
