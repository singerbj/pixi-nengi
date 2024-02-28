"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ncontext = exports.NType = void 0;
const nengi_1 = require("nengi");
const IdentityMessage_1 = require("./IdentityMessage");
const Entity_1 = require("./Entity");
const InputCommand_1 = require("./InputCommand");
const ShotMessage_1 = require("./ShotMessage");
const StatsEntity_1 = require("./StatsEntity");
/**
 * A 1-255 value for the TYPES of things your game can send
 * If you create any entity, message, or command, add an entry here
 */
var NType;
(function (NType) {
    NType[NType["NULL"] = 0] = "NULL";
    NType[NType["IdentityMessage"] = 1] = "IdentityMessage";
    NType[NType["InputCommand"] = 2] = "InputCommand";
    NType[NType["ShotMessage"] = 3] = "ShotMessage";
    NType[NType["Entity"] = 4] = "Entity";
    NType[NType["StatsEntity"] = 5] = "StatsEntity";
    NType[NType["Channel"] = 6] = "Channel";
})(NType || (exports.NType = NType = {}));
exports.ncontext = new nengi_1.Context();
exports.ncontext.register(NType.IdentityMessage, IdentityMessage_1.identitySchema);
exports.ncontext.register(NType.InputCommand, InputCommand_1.inputSchema);
exports.ncontext.register(NType.ShotMessage, ShotMessage_1.shotMessageSchema);
exports.ncontext.register(NType.Entity, Entity_1.entitySchema);
exports.ncontext.register(NType.StatsEntity, StatsEntity_1.statsEntitySchema);
exports.ncontext.register(NType.Channel, (0, nengi_1.defineSchema)({}));
