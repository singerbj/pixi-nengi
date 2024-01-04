import { Binary, defineSchema } from "nengi";
import { NType } from "./ncontext";

export const inputSchema = defineSchema({
  up: Binary.Boolean,
  down: Binary.Boolean,
  left: Binary.Boolean,
  right: Binary.Boolean,
  delta: Binary.Float64,
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
  delta: number;

  constructor(delta: number) {
    this.delta = delta;
  }
}
