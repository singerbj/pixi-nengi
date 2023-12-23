import { Binary, defineSchema } from 'nengi'
import { NType } from './ncontext'

export const statsEntitySchema = defineSchema({
    // nid: Binary.UInt32 is already included by nengi
    // ntype: Binary.UInt8 is already included by nengi
    cpuMillisecondsPerTick: Binary.Float32,
    userCount: Binary.UInt16,
    entityCount: Binary.UInt32, // just in case we try having more than 65535 entities later...
    averageDeltaMs: Binary.Float32,
    averageCPUFrameMs: Binary.Float32,
})

/**
 * Defines a basic entity with a 2D position, we happen to name the class "Entity"
 * out of laziness, but this is not a nengi class -- it belongs to your game, call it
 * hero or goblin or whatever! :)
 */
export class StatsEntity {
    nid = 0 // will be assigned by nengi, 0 is a placeholder
    ntype = NType.StatsEntity
    cpuMillisecondsPerTick = 0 // how long the game update took in milliseconds
    userCount = 0 // how many users are connected to the instance
    entityCount = 0 // how many entities are in the instance

    averageDeltaMs = 0
    averageCPUFrameMs = 0

    _deltas: number[] = []
    _deltasSampleSize = 10
    _cpuFrames: number[] = []
    _cpuFramesSampleSize = 10

    registerDelta(deltaMs: number) {
        this._deltas.unshift(deltaMs)
        while (this._deltas.length > this._deltasSampleSize) {
            this._deltas.pop()
        }
        let total = 0
        for (let i = 0; i < this._deltas.length; i++) {
            total += this._deltas[i]
        }
        this.averageDeltaMs = total / this._deltasSampleSize
    }

    registerCPUFrame(frametime: number) {
        this._cpuFrames.unshift(frametime)
        while (this._cpuFrames.length > this._cpuFramesSampleSize) {
            this._cpuFrames.pop()
        }
        let total = 0
        for (let i = 0; i < this._cpuFrames.length; i++) {
            total += this._cpuFrames[i]
        }
        this.averageCPUFrameMs = total / this._cpuFramesSampleSize
    }
}