import { BodyOptions, Box, PotentialVector } from "detect-collisions";
import { PLAYER_HEIGHT, PLAYER_WIDTH } from "../common/Constants";

export const possibleCollideableTypes = ["Entity"] as const;
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

export type EntityBoxCustomOptions = {
  type: CollidableType;
};

export class EntityBox extends Box {
  customOptions: EntityBoxCustomOptions | undefined;
  constructor(
    position: PotentialVector,
    width: number,
    height: number,
    options?: BodyOptions | undefined,
    customOptions?: EntityBoxCustomOptions
  ) {
    super(position, width, height, options);
    this.customOptions = customOptions;
  }
}

export interface Collidable {
  type: CollidableType;
  collider: EntityBox;
  updateColliderFromPosition: () => void;
  updatePositionFromCollider: () => void;
}

// export class Collidable {
//   type: CollidableType;
//   x = 0;
//   y = 0;
//   collider: EntityBox;

//   constructor(type: string) {
//     this.type = isCollidableType(type);
//     this.collider = new EntityBox(
//       { x: this.x, y: this.y },
//       PLAYER_WIDTH,
//       PLAYER_HEIGHT,
//       {},
//       {
//         type: this.type,
//       }
//     );
//   }

//   resetCollider() {
//     this.collider = new EntityBox(
//       { x: this.x, y: this.y },
//       PLAYER_WIDTH,
//       PLAYER_HEIGHT,
//       {
//         isStatic: false,
//       },
//       {
//         type: this.type,
//       }
//     );
//   }

//   updateColliderFromPosition() {
//     this.collider.setPosition(this.x, this.y);
//     this.collider.updateBody();
//   }

//   updatePositionFromCollider() {
//     this.x = this.collider.pos.x;
//     this.y = this.collider.pos.y;
//   }
// }
