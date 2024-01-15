////////////////////////////////////////////////////////////////////////////////////////////////////
// TODO: the historian is not yet implemented yet for nengi 2. might have to wait for that
////////////////////////////////////////////////////////////////////////////////////////////////////

import { RaycastHit } from "detect-collisions";
import { collisionService } from "../common/CollisionService";
import { Entity } from "../common/Entity";
import { ShotMessage } from "../common/ShotMessage";
import Historian from "./historian/Historian";
import {
  calculateDistance,
  getNewPointOnLineWithDistance,
} from "../common/Util";
import { SHOT_DISTANCE } from "../common/Constants";

type RaycastHitWithVictim = {
  hit: RaycastHit<Body>;
  victim: Entity;
};

export default (
  historian: Historian,
  shooterId: number,
  timeAgo: number,
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  ignoreNids: number[] = []
): ShotMessage => {
  const pastEntities = historian.getLagCompensatedArea(timeAgo);

  // Get the actual shot coordinates based on the shot distance and the user input
  const [newTargetX, newTargetY] = getNewPointOnLineWithDistance(
    originX,
    originY,
    targetX,
    targetY,
    SHOT_DISTANCE
  );

  const allHits: RaycastHitWithVictim[] = [];
  // pastEntities.forEach((pastEntity: Entity) => {

  //   if (hit) {
  //     allHits.push({
  //       hit: hit,
  //       victim: pastEntity,
  //     });
  //   }
  // });

  console.log("===================================================");
  //TODO: fix this somehow
  //@ts-expect-error
  const hit: RaycastHit<Body> | null = collisionService.system.raycast(
    { x: originX, y: originY },
    { x: newTargetX, y: newTargetY },
    (body): boolean => {
      //TODO: fix this somehow
      //@ts-ignore
      const nid = body.customOptions.nid;
      return nid === undefined || !ignoreNids.includes(nid);
    }
  );

  if (hit !== null) {
    // const closestHit = allHits
    //   .filter((hit) => {
    //     return !ignoreNids.includes(hit.victim.nid);
    //   })
    //   .sort(
    //     (a, b) =>
    //       calculateDistance(originX, b.hit.point.x, originY, b.hit.point.y)
    //         .dist -
    //       calculateDistance(originX, a.hit.point.x, originY, a.hit.point.y).dist
    //   )[0];

    return new ShotMessage(
      shooterId,
      originX,
      originY,
      newTargetX,
      newTargetY,
      true,
      hit.point.x,
      hit.point.y,
      //@ts-ignore
      hit.body.customOptions.nid || 0
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
};
