"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessages = void 0;
const ncontext_1 = require("../common/ncontext");
function handleMessages(renderer, client, state) {
    // messages from the server
    while (client.network.messages.length > 0) {
        const message = client.network.messages.pop();
        if (message.ntype === ncontext_1.NType.IdentityMessage) {
            state.myId = message.myId;
        }
        else if (message.ntype === ncontext_1.NType.ShotMessage) {
            renderer.renderShot(message);
        }
    }
}
exports.handleMessages = handleMessages;
