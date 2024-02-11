////////////////////////////////////////////////////////////////////////////////////////////////////
// TODO: the historian is not yet implemented yet for nengi 2. might have to wait for that
////////////////////////////////////////////////////////////////////////////////////////////////////

import { RaycastHit } from "detect-collisions";
import { ShotMessage } from "../common/ShotMessage";
import SpacialStructureHistorian from "./spacialStructureHistorian/SpacialStructureHistorian";
import { getNewPointOnLineWithDistance } from "../common/Util";
import { SHOT_DISTANCE } from "../common/Constants";

export default (
  historian: SpacialStructureHistorian,
  shooterId: number,
  timeAgo: number,
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  ignoreNids: number[] = []
): ShotMessage => {
  // const pastEntities = historian.getLagCompensatedEntities(timeAgo);
  const pastSpacialStructure =
    historian.getLagCompensatedSpacialStructure(timeAgo);

  // use the smoothed system for calculations because thats what players are shooting at
  const pastSystem = pastSpacialStructure?.ssystem;

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
    (body: any): boolean => {
      //TODO: fix this somehow
      //@ts-ignore
      const nid = body.customOptions.nid;
      // console.log(body);
      return nid === undefined || !ignoreNids.includes(nid);
    }
  );

  if (hit !== null) {
    // TODO: fix this
    //@ts-ignore
    // console.log(hit.body.customOptions.nid, hit.body.customOptions.soft);
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
