"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePredictionErrors = void 0;
const Entity_1 = require("../common/Entity");
const handleInput_1 = require("../common/handleInput");
const ncontext_1 = require("../common/ncontext");
function handlePredictionErrors(client, state) {
    // errors in clientside prediction (determined based on fresh server data this frame)
    while (client.network.predictionErrorFrames.length > 0) {
        const predictionErrorFrame = client.network.predictionErrorFrames.pop();
        const entityState = state.entities.get(state.myId);
        const entity = entityState;
        if (entity !== undefined) {
            predictionErrorFrame.entities.forEach((predictionErrorEntity) => {
                // correct any prediction errors with server values...
                predictionErrorEntity.errors.forEach((predictionErrorProperty) => {
                    const { prop, actualValue } = predictionErrorProperty;
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    entity[prop] = actualValue;
                });
                // and then re-apply any commands issued since the frame that had the prediction error
                const unconfirmedCommands = client.network.outbound.getUnconfirmedCommands(); // client knows which commands need redone
                console.log("unconfirmedCommands", unconfirmedCommands);
                unconfirmedCommands.forEach((unconfirmedCommandSet, clientTick) => {
                    unconfirmedCommandSet.forEach((unconfirmedCommand) => {
                        // example assumes 'PlayerInput' is the command we are predicting
                        if (unconfirmedCommand.ntype === ncontext_1.NType.InputCommand) {
                            // entity.processMove(command)
                            (0, handleInput_1.handleInput)(entity, unconfirmedCommand);
                            // client.addCustomPrediction(clientTick, prediction, ['x', 'y']) // overwrite
                            const { nid, x, y } = entity;
                            client.predictor.addCustom(clientTick, { nid, x, y }, ["x", "y"], Entity_1.entitySchema);
                        }
                    });
                });
            });
        }
    }
}
exports.handlePredictionErrors = handlePredictionErrors;
