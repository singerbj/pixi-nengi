"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsEntity = exports.statsEntitySchema = void 0;
const nengi_1 = require("nengi");
const ncontext_1 = require("./ncontext");
exports.statsEntitySchema = (0, nengi_1.defineSchema)({
    // nid: Binary.UInt32 is already included by nengi
    // ntype: Binary.UInt8 is already included by nengi
    cpuMillisecondsPerTick: nengi_1.Binary.Float32,
    userCount: nengi_1.Binary.UInt16,
    entityCount: nengi_1.Binary.UInt32, // just in case we try having more than 65535 entities later...
    averageDeltaMs: nengi_1.Binary.Float32,
    averageCPUFrameMs: nengi_1.Binary.Float32,
});
/**
 * Defines a basic entity with a 2D position, we happen to name the class "Entity"
 * out of laziness, but this is not a nengi class -- it belongs to your game, call it
 * hero or goblin or whatever! :)
 */
class StatsEntity {
    constructor() {
        this.nid = 0; // will be assigned by nengi, 0 is a placeholder
        this.ntype = ncontext_1.NType.StatsEntity;
        this.cpuMillisecondsPerTick = 0; // how long the game update took in milliseconds
        this.userCount = 0; // how many users are connected to the instance
        this.entityCount = 0; // how many entities are in the instance
        this.averageDeltaMs = 0;
        this.averageCPUFrameMs = 0;
        this._deltas = [];
        this._deltasSampleSize = 10;
        this._cpuFrames = [];
        this._cpuFramesSampleSize = 10;
    }
    registerDelta(deltaMs) {
        this._deltas.unshift(deltaMs);
        while (this._deltas.length > this._deltasSampleSize) {
            this._deltas.pop();
        }
        let total = 0;
        for (let i = 0; i < this._deltas.length; i++) {
            total += this._deltas[i];
        }
        this.averageDeltaMs = total / this._deltasSampleSize;
    }
    registerCPUFrame(frametime) {
        this._cpuFrames.unshift(frametime);
        while (this._cpuFrames.length > this._cpuFramesSampleSize) {
            this._cpuFrames.pop();
        }
        let total = 0;
        for (let i = 0; i < this._cpuFrames.length; i++) {
            total += this._cpuFrames[i];
        }
        this.averageCPUFrameMs = total / this._cpuFramesSampleSize;
    }
}
exports.StatsEntity = StatsEntity;
