import { Client, PredictionErrorEntity, PredictionErrorProperty } from "nengi";
import { State } from "./State";
import { Entity, entitySchema } from "../common/Entity";
import { handleInput } from "../common/handleInput";
import { NType } from "../common/ncontext";

export const handlePredictionErrors = (client: Client, state: State) => {
  // errors in clientside prediction (determined based on fresh server data this frame)
  while (client.network.predictionErrorFrames.length > 0) {
    const predictionErrorFrame = client.network.predictionErrorFrames.pop();
    const entityState = state.entities.get(state.myId);
    const entity: Entity | undefined = entityState;

    if (entity !== undefined) {
      predictionErrorFrame.entities.forEach(
        (predictionErrorEntity: PredictionErrorEntity) => {
          // correct any prediction errors with server values...
          predictionErrorEntity.errors.forEach(
            (predictionErrorProperty: PredictionErrorProperty) => {
              const { prop, actualValue } = predictionErrorProperty;
              //@ts-ignore
              entity[prop] = actualValue;
            }
          );

          // and then re-apply any commands issued since the frame that had the prediction error
          const unconfirmedCommands =
            client.network.outbound.getUnconfirmedCommands(); // client knows which commands need redone
          console.log("unconfirmedCommands", unconfirmedCommands);
          unconfirmedCommands.forEach((unconfirmedCommandSet, clientTick) => {
            unconfirmedCommandSet.forEach((unconfirmedCommand) => {
              // example assumes 'PlayerInput' is the command we are predicting
              if (unconfirmedCommand.ntype === NType.InputCommand) {
                // entity.processMove(command)
                handleInput(entity, unconfirmedCommand);
                // client.addCustomPrediction(clientTick, prediction, ['x', 'y']) // overwrite
                const { nid, x, y } = entity;
                client.predictor.addCustom(
                  clientTick,
                  { nid, x, y },
                  ["x", "y"],
                  entitySchema
                );
              }
            });
          });
        }
      );
    }
  }
};
