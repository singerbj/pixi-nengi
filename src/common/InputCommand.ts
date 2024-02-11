import { Binary, defineSchema } from "nengi";
import { NType } from "./ncontext";

export const inputSchema = defineSchema({
  up: Binary.Boolean,
  down: Binary.Boolean,
  left: Binary.Boolean,
  right: Binary.Boolean,
  shooting: Binary.Boolean,
  mouseX: Binary.Float64,
  mouseY: Binary.Float64,
  delta: Binary.Float64,
  // time: Binary.Float64,
});

/**
 * Defines user input representing moving with the keyboard or a directional pad
 */
export class InputCommand {
  ntype = NType.InputCommand;
  up = false;
  down = false;
  left = false;
  right = false;
  shooting = false;
  mouseX = 0;
  mouseY = 0;
  delta: number;
  // time: number;

  constructor(delta: number) {
    //}, time: number) {
    this.delta = delta;
    // this.time = time;
  }
}
