import { Client } from "nengi";
import { InputCommand } from "../common/InputCommand";
import { handleInput } from "../common/handleInput";
import { entitySchema } from "../common/Entity";
import { State } from "./State";
import { PIXIRenderer } from "../rendering/PIXIRenderer";
import { ENTITY_SPEED } from "../common/Constants";

export const predictInput = (
  delta: number,
  state: State,
  inputCommand: InputCommand,
  client: Client
) => {
  const entity = state.entities.get(state.myId);
  if (entity !== undefined && state.isPredictionEnabled) {
    handleInput(entity, inputCommand);

    // entity.y += ENTITY_SPEED * delta;

    const { x, y } = entity;
    client.predictor.addCustom(
      client.network.clientTick,
      { nid: state.myId, x, y },
      ["x", "y"],
      entitySchema
    );
  }
};
