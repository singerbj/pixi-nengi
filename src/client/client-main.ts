import {
  PEERJS_CLIENT_TYPE,
  WS_CLIENT_TYPE,
  createClient,
} from "./createClient";

const urlParams = new URLSearchParams(window.location.search);
const peerId = urlParams.get("id");

if (peerId) {
  createClient({
    type: PEERJS_CLIENT_TYPE,
    peerId,
    handshake: { token: 12345 },
  });
} else {
  createClient({
    type: WS_CLIENT_TYPE,
    wsUrl: "ws://localhost:9001",
    handshake: { token: 12345 },
  });
}
