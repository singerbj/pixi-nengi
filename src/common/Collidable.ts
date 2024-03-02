import { BodyOptions, Box, PotentialVector } from "detect-collisions";
import { MapObject } from "./MapObject";

export enum CollidableType {
  Entity,
  MapObject,
}

export class CustomBox extends Box {
  collidableType: CollidableType;
  nid?: number;

  constructor(
    position: PotentialVector,
    width: number,
    height: number,
    collidableType: CollidableType,
    options?: BodyOptions | undefined,
    nid?: number
  ) {
    super(position, width, height, options);
    this.collidableType = collidableType;
    this.nid = nid;
  }
}

export interface StaticCollidable {
  collidableType: CollidableType;
  collider: CustomBox;
}

export interface DynamicCollidable extends StaticCollidable {
  updateColliderFromPosition: () => void;
  updatePositionFromCollider: () => void;
}
