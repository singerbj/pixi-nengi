import { FederatedPointerEvent, Point, Renderer } from "pixi.js";
import { InputCommand } from "../common/InputCommand";
import { PIXIRenderer } from "../rendering/PIXIRenderer";

// we could make this editable with an api, but this is just quick and dirty
const keybindingLayer = new Map();
keybindingLayer.set("w", "up");
keybindingLayer.set(" ", "up");
keybindingLayer.set("a", "left");
keybindingLayer.set("s", "down");
keybindingLayer.set("d", "right");

type ValidKeybind = "up" | "down" | "left" | "right";
type InputState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shooting: boolean;
  mouseX: number;
  mouseY: number;
};

export class InputSystem {
  renderer: PIXIRenderer;
  perFrameInputState: InputState;
  currentInputState: InputState;
  lastFederatedPointerEvent: FederatedPointerEvent | undefined;

  constructor(renderer: PIXIRenderer) {
    this.renderer = renderer;
    this.perFrameInputState = {
      up: false,
      down: false,
      left: false,
      right: false,
      shooting: false,
      mouseX: 0,
      mouseY: 0,
    };
    this.currentInputState = {
      up: false,
      down: false,
      left: false,
      right: false,
      shooting: false,
      mouseX: 0,
      mouseY: 0,
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

    this.renderer.stage.on("mousedown", (e: FederatedPointerEvent) => {
      this.lastFederatedPointerEvent = e;
      this.perFrameInputState.shooting = true;
      this.currentInputState.shooting = true;
    });

    this.renderer.stage.on("mouseup", (e: FederatedPointerEvent) => {
      this.lastFederatedPointerEvent = e;
      this.currentInputState.shooting = false;
    });

    this.renderer.stage.on("mousemove", (e: FederatedPointerEvent) => {
      this.lastFederatedPointerEvent = e;
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

    if (!this.currentInputState.shooting) {
      this.perFrameInputState.shooting = false;
    }
  }

  setMousePosition(e: FederatedPointerEvent) {
    const localPlayerGraphicalEntity = this.renderer.graphicalEntitites.get(
      this.renderer.state.myId
    );
    if (localPlayerGraphicalEntity !== undefined) {
      const localPointerPosition = e.getLocalPosition(
        localPlayerGraphicalEntity
      );
      localPointerPosition.x += localPlayerGraphicalEntity.x;
      localPointerPosition.y += localPlayerGraphicalEntity.y;

      this.perFrameInputState.mouseX = localPointerPosition.x;
      this.currentInputState.mouseX = localPointerPosition.x;
      this.perFrameInputState.mouseY = localPointerPosition.y;
      this.currentInputState.mouseY = localPointerPosition.y;
    }
  }

  createNetworkCommand(delta: number, _time: number): InputCommand {
    const inputCommand = new InputCommand(delta);
    if (this.lastFederatedPointerEvent) {
      this.setMousePosition(this.lastFederatedPointerEvent);
    }
    Object.assign(inputCommand, this.perFrameInputState);

    return inputCommand;
  }
}
