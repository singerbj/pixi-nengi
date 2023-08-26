import { Context } from 'nengi'
import { identitySchema } from './IdentityMessage'
import { entitySchema } from './Entity'
import { moveSchema } from './MoveCommand'

/**
 * A 1-255 value for the TYPES of things your game can send
 * If you create any entity, message, or command, add an entry here
 */
export enum NType {
    NULL = 0,
    IdentityMessage,
    MoveCommand,
    Entity
}

export const ncontext = new Context()
ncontext.register(NType.IdentityMessage, identitySchema)
ncontext.register(NType.Entity, entitySchema)
ncontext.register(NType.MoveCommand, moveSchema)