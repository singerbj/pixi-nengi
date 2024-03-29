import { Binary, defineSchema } from "nengi";
import { NType } from "./ncontext";

export const identitySchema = defineSchema({
  myId: Binary.UInt32,
});

/**
 * Defines a message that tells the client which entity it controls
 */
export class IdentityMessage {
  ntype = NType.IdentityMessage;
  myId: number;
  constructor(nid: number) {
    this.myId = nid;
  }
}
