"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictInput = void 0;
const handleInput_1 = require("../common/handleInput");
const Entity_1 = require("../common/Entity");
const predictInput = (delta, renderer, state, inputCommand, client) => {
    const entity = state.entities.get(state.myId);
    if (entity !== undefined && state.isPredictionEnabled) {
        const [shooting, shotMessage] = (0, handleInput_1.handleInput)(entity, inputCommand);
        if (shooting) {
            //TODO: uncomment to draw a predicted shot
            // renderer.renderShot(shotMessage);
        }
        const { x, y } = entity;
        client.predictor.addCustom(client.network.clientTick, { nid: state.myId, x, y }, ["x", "y"], Entity_1.entitySchema);
    }
};
exports.predictInput = predictInput;
