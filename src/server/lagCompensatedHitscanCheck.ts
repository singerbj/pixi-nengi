////////////////////////////////////////////////////////////////////////////////////////////////////
// TODO: the historian is not yet implemented yet for nengi 2. might have to wait for that
////////////////////////////////////////////////////////////////////////////////////////////////////

import { RaycastHit } from "detect-collisions";
import { ShotMessage } from "../common/ShotMessage";
import Historian from "./historian/Historian";
import { getNewPointOnLineWithDistance } from "../common/Util";
import { SHOT_DISTANCE } from "../common/Constants";

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
  // const pastEntities = historian.getLagCompensatedEntities(timeAgo);
  const pastSystem =
    historian.getLagCompensatedSpacialStructure(timeAgo)?.system;

  // Get the actual shot coordinates based on the shot distance and the user input
  const [newTargetX, newTargetY] = getNewPointOnLineWithDistance(
    originX,
    originY,
    targetX,
    targetY,
    SHOT_DISTANCE
  );
  //TODO: fix this somehow
  //@ts-expect-error
  const hit: RaycastHit<Body> | null = pastSystem.raycast(
    { x: originX, y: originY },
    { x: newTargetX, y: newTargetY },
    (body): boolean => {
      //TODO: fix this somehow
      //@ts-ignore
      const nid = body.customOptions.nid;
      // console.log(body);
      return nid === undefined || !ignoreNids.includes(nid);
    }
  );

  if (hit !== null) {
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
