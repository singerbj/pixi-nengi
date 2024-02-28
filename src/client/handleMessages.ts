import { Client } from "nengi";
import { State } from "./State";
import { NType } from "../common/ncontext";
import { PIXIRenderer } from "../rendering/PIXIRenderer";

export function handleMessages(
  renderer: PIXIRenderer,
  client: Client,
  state: State
) {
  // messages from the server
  while (client.network.messages.length > 0) {
    const message = client.network.messages.pop();

    if (message.ntype === NType.IdentityMessage) {
      state.myId = message.myId;
    } else if (message.ntype === NType.ShotMessage) {
      renderer.renderShot(message);
    }
  }
}
