import { Binary, defineSchema } from "nengi";
import { NType } from "./ncontext";

export const shotMessageSchema = defineSchema({
  shooterId: Binary.Float64,
  originX: Binary.Float64,
  originY: Binary.Float64,
  targetX: Binary.Float64,
  targetY: Binary.Float64,
  hit: Binary.Boolean,
  hitX: Binary.Float64,
  hitY: Binary.Float64,
  hitEntityId: Binary.Float64,
});

export class ShotMessage {
  ntype = NType.ShotMessage;
  shooterId: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  hit: boolean;
  hitX: number;
  hitY: number;
  hitEntityId: number;

  constructor(
    shooterId: number,
    originX: number,
    originY: number,
    targetX: number,
    targetY: number,
    hit: boolean,
    hitX: number,
    hitY: number,
    hitEntityId: number
  ) {
    this.shooterId = shooterId;
    this.originX = originX;
    this.originY = originY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.hit = hit;
    this.hitX = hitX;
    this.hitY = hitY;
    this.hitEntityId = hitEntityId;
  }
}
