"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityMessage = exports.identitySchema = void 0;
const nengi_1 = require("nengi");
const ncontext_1 = require("./ncontext");
exports.identitySchema = (0, nengi_1.defineSchema)({
    myId: nengi_1.Binary.UInt32,
});
/**
 * Defines a message that tells the client which entity it controls
 */
class IdentityMessage {
    constructor(nid) {
        this.ntype = ncontext_1.NType.IdentityMessage;
        this.myId = nid;
    }
}
exports.IdentityMessage = IdentityMessage;
