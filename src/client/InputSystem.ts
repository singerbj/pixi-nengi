import { MoveCommand } from "../common/MoveCommand";

// we could make this editable with an api, but this is just quick and dirty
const keybindingLayer = new Map();
keybindingLayer.set("w", "up");
keybindingLayer.set("a", "left");
keybindingLayer.set("s", "down");
keybindingLayer.set("d", "right");

type ValidKeybind = "up" | "down" | "left" | "right";
type InputState = { up: boolean; down: boolean; left: boolean; right: boolean };

export class InputSystem {
  perFrameInputState: InputState;
  currentInputState: InputState;

  constructor() {
    this.perFrameInputState = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.currentInputState = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (keybindingLayer.has(e.key)) {
        const bind = keybindingLayer.get(e.key) as ValidKeybind;
        this.perFrameInputState[bind] = true;
        this.currentInputState[bind] = true;
      }
    });

    document.addEventListener("keyup", (e: KeyboardEvent) => {
      if (keybindingLayer.has(e.key)) {
        const bind = keybindingLayer.get(e.key) as ValidKeybind;
        this.currentInputState[bind] = false;
      }
    });
  }

  resetKeys() {
    // we reset all of the keys for the frame to false, unless they're still being held down
    // at the moment that we invoke resetKeys (which is at the end of every frame)
    if (!this.currentInputState.up) {
      this.perFrameInputState.up = false;
    }

    if (!this.currentInputState.down) {
      this.perFrameInputState.down = false;
    }

    if (!this.currentInputState.left) {
      this.perFrameInputState.left = false;
    }

    if (!this.currentInputState.right) {
      this.perFrameInputState.right = false;
    }
  }

  createNetworkCommand(delta: number): MoveCommand {
    const moveCommand = new MoveCommand(delta);
    Object.assign(moveCommand, this.perFrameInputState);
    return moveCommand;
  }
}
