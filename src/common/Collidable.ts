import { BodyOptions, Box, PotentialVector } from "detect-collisions";

export const possibleCollideableTypes = ["Entity", "MapObject"] as const;
export type CollidableType = (typeof possibleCollideableTypes)[number];

export const isCollidableType = (
  maybeCollidableType: string
): CollidableType => {
  const collidableType = possibleCollideableTypes.find(
    (validCollidableType) => validCollidableType === maybeCollidableType
  );
  if (collidableType) {
    return collidableType;
  } else {
    throw new Error(
      "That is not a valid CollidableType: " + maybeCollidableType
    );
  }
};

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
