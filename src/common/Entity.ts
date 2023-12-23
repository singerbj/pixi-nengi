import { Binary, defineSchema } from 'nengi'
import { NType } from './ncontext'

export const entitySchema = defineSchema({
    // nid: Binary.UInt32 is already included by nengi
    // ntype: Binary.UInt8 is already included by nengi
    x: { type: Binary.Float64, interp: true },
    y: { type: Binary.Float64, interp: true }
})

/**
 * Defines a basic entity with a 2D position, we happen to name the class "Entity"
 * out of laziness, but this is not a nengi class -- it belongs to your game, call it
 * hero or goblin or whatever! :)
 */
export class Entity {
    nid = 0 // will be assigned by nengi, 0 is a placeholder
    ntype = NType.Entity
    x = 0
    y = 0
    walkingRight = true
    age = 0
    maxAge = 0
    speed = 0
}