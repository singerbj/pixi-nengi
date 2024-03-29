import { Client } from "nengi";
import { InputCommand } from "../common/InputCommand";
import { handleInput } from "../common/handleInput";
import { entitySchema } from "../common/Entity";
import { State } from "./State";
import { PIXIRenderer } from "../rendering/PIXIRenderer";

export const predictInput = (
  delta: number,
  renderer: PIXIRenderer,
  state: State,
  inputCommand: InputCommand,
  client: Client
) => {
  const entity = state.entities.get(state.myId);
  if (entity !== undefined && state.isPredictionEnabled) {
    const [shooting, shotMessage] = handleInput(entity, inputCommand);

    if (shooting) {
      //TODO: uncomment to draw a predicted shot
      // renderer.renderShot(shotMessage);
    }

    const { x, y } = entity;
    client.predictor.addCustom(
      client.network.clientTick,
      { nid: state.myId, x, y },
      ["x", "y"],
      entitySchema
    );
  }
};
