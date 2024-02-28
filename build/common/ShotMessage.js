"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShotMessage = exports.shotMessageSchema = void 0;
const nengi_1 = require("nengi");
const ncontext_1 = require("./ncontext");
exports.shotMessageSchema = (0, nengi_1.defineSchema)({
    shooterId: nengi_1.Binary.Float64,
    originX: nengi_1.Binary.Float64,
    originY: nengi_1.Binary.Float64,
    targetX: nengi_1.Binary.Float64,
    targetY: nengi_1.Binary.Float64,
    hit: nengi_1.Binary.Boolean,
    hitX: nengi_1.Binary.Float64,
    hitY: nengi_1.Binary.Float64,
    hitEntityId: nengi_1.Binary.Float64,
});
class ShotMessage {
    constructor(shooterId, originX, originY, targetX, targetY, hit, hitX, hitY, hitEntityId) {
        this.ntype = ncontext_1.NType.ShotMessage;
        this.shooterId = shooterId;
        this.originX = originX;
        this.originY = originY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.hit = hit;
        this.hitX = hitX;
        this.hitY = hitY;
        this.hitEntityId = hitEntityId;
    }
}
exports.ShotMessage = ShotMessage;
