////////////////////////////////////////////////////////////////////////////////////////////////////
// TODO: the historian is not yet implemented yet for nengi 2. might have to wait for that
////////////////////////////////////////////////////////////////////////////////////////////////////

import { collisionService } from "../common/CollisionService";
import { Entity } from "../common/Entity";
import Historian from "./historian/Historian";

type Point = { x: number; y: number };

type BulletHit = {
  point: Point;
  nid: number;
};

export default (
  historian: Historian,
  timeAgo: number,
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  ignoreNids: number[] = []
) => {
  // this is querying the whole game area of the demo, but if the game had a lot of entities
  // // it would make sense to query just the rectangle containing the ray + a little bit of padding
  // const area = {
  //   x: 0,
  //   y: 0,
  //   z: 0,
  //   halfWidth: 999999,
  //   halfHeight: 999999,
  //   halfDepth: 999999,
  // };

  const hits: BulletHit[] = [];
  const pastEntities = historian.getLagCompensatedArea(timeAgo);

  pastEntities.forEach((pastEntity: Entity) => {
    const hit = collisionService.system.raycast(
      { x: originX, y: originY },
      { x: targetX, y: targetY }
    );

    if (hit && !ignoreNids.includes(pastEntity.nid)) {
      hits.push({
        point: hit.point,
        nid: pastEntity.nid,
      });
    }
  });
  return hits;
};
