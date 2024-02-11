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

export type CustomBoxCustomOptions = {
  type: CollidableType;
  nid?: number;
  soft?: boolean;
};

export class CustomBox extends Box {
  customOptions: CustomBoxCustomOptions | undefined;
  constructor(
    position: PotentialVector,
    width: number,
    height: number,
    options?: BodyOptions | undefined,
    customOptions?: CustomBoxCustomOptions
  ) {
    super(position, width, height, options);
    this.customOptions = customOptions;
  }
}

export interface StaticCollidable {
  type: CollidableType;
  collider: CustomBox;
}

export interface DynamicCollidable extends StaticCollidable {
  updateColliderFromPosition: () => void;
  updatePositionFromCollider: () => void;
}
