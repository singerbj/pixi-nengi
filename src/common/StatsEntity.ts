import { Binary, defineSchema } from "nengi";
import { NType } from "./ncontext";

export const statsEntitySchema = defineSchema({
  // nid: Binary.UInt32 is already included by nengi
  // ntype: Binary.UInt8 is already included by nengi
  cpuMillisecondsPerTick: Binary.Float32,
  userCount: Binary.UInt16,
  entityCount: Binary.UInt32, // just in case we try having more than 65535 entities later...
  averageDeltaMs: Binary.Float32,
  averageFrameTimeMs: Binary.Float32,
});

/**
 * Defines a basic entity with a 2D position, we happen to name the class "Entity"
 * out of laziness, but this is not a nengi class -- it belongs to your game, call it
 * hero or goblin or whatever! :)
 */
export class StatsEntity {
  nid = 0; // will be assigned by nengi, 0 is a placeholder
  ntype = NType.StatsEntity;
  cpuMillisecondsPerTick = 0; // how long the game update took in milliseconds
  userCount = 0; // how many users are connected to the instance
  entityCount = 0; // how many entities are in the instance
  userLatency = 0;

  averageDeltaMs = 0;
  averageFrameTimeMs = 0;

  _deltas: number[] = [];
  _deltasSampleSize = 10;
  _frameTimes: number[] = [];
  _framesTimeSampleSize = 10;

  registerDelta(deltaMs: number) {
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

  registerFrametime(frametime: number) {
    this._frameTimes.unshift(frametime);
    while (this._frameTimes.length > this._framesTimeSampleSize) {
      this._frameTimes.pop();
    }
    let total = 0;
    for (let i = 0; i < this._frameTimes.length; i++) {
      total += this._frameTimes[i];
    }
    this.averageFrameTimeMs = total / this._framesTimeSampleSize;
  }
}
