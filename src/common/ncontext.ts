import { Context, defineSchema } from "nengi";
import { identitySchema } from "./IdentityMessage";
import { entitySchema } from "./Entity";
import { inputSchema } from "./InputCommand";
import { shotMessageSchema } from "./ShotMessage";
import { statsEntitySchema } from "./StatsEntity";

/**
 * A 1-255 value for the TYPES of things your game can send
 * If you create any entity, message, or command, add an entry here
 */
export enum NType {
  NULL = 0,
  IdentityMessage,
  InputCommand,
  ShotMessage,
  Entity,
  StatsEntity,
  Channel,
}

export const ncontext = new Context();
ncontext.register(NType.IdentityMessage, identitySchema);
ncontext.register(NType.InputCommand, inputSchema);
ncontext.register(NType.ShotMessage, shotMessageSchema);
ncontext.register(NType.Entity, entitySchema);
ncontext.register(NType.StatsEntity, statsEntitySchema);
ncontext.register(NType.Channel, defineSchema({}));
