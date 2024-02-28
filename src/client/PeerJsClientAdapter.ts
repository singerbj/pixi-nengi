import { EngineMessage, BinarySection, ClientNetwork, Context } from "nengi";
import { DataViewReader, DataViewWriter } from "nengi-dataviews";
import { Peer, DataConnection } from "peerjs";

export class PeerJSClientAdapter {
  peer: Peer | undefined;
  network: ClientNetwork;
  context: Context;
  authenticated: boolean = false;
  conn: DataConnection | undefined;

  constructor(network: ClientNetwork, config: any) {
    this.network = network;
    this.context = this.network.client.context;
  }

  flush() {
    const buffer = this.network.createOutboundBuffer(DataViewWriter);
    if (this.conn) {
      this.conn.send(buffer);
    } else {
      console.error("No connection established, not flushing");
    }
  }

  connect(serverId: string, handshake: any) {
    const self = this;
    return new Promise((resolve, reject) => {
      // @ts-ignore
      self.peer = new Peer(null, {
        debug: 2,
        host: "localhost",
        port: 9002,
      });
      self.peer.on("open", (id) => {
        self.conn = self.peer!.connect(serverId);

        console.log(`Connecting to PeerJs server with id: ${serverId}`);

        self.conn.on("open", () => {
          console.log("Client is connected to server!");
          self.conn!.send(
            self.network.createHandshakeBuffer(handshake, DataViewWriter)
          );
          self.conn!.on("data", (data) => {
            // console.log("data recieved from " + self.conn!.peer + ":", data);

            // initially the only thing we care to read is a response to our handshake
            // we don't even setup the parser for the rest of what a nengi client can receive
            const dr = new DataViewReader(data as ArrayBuffer, 0);
            const type = dr.readUInt8(); // type of message

            if (self.authenticated === false) {
              if (type === BinarySection.EngineMessages) {
                const count = dr.readUInt8(); // quantity of engine messages
                const connectionResponseByte = dr.readUInt8();
                if (
                  connectionResponseByte === EngineMessage.ConnectionAccepted
                ) {
                  self.authenticated = true;
                  resolve("accepted");
                }
                if (connectionResponseByte === EngineMessage.ConnectionDenied) {
                  const denyReason = JSON.parse(dr.readString());
                  reject(denyReason);
                }
              }
            } else {
              // setup listeners for normal game data
              const dr = new DataViewReader(data as ArrayBuffer, 0);
              self.network.readSnapshot(dr);
            }
          });
          self.conn!.on("close", () => {
            const message = "close (conn) " + self.conn!.peer;
            console.log(message);
            self.network.onDisconnect(message);
          });
          self.conn!.on("error", (data) => {
            const message = "error (conn) " + self.conn!.peer + ": ";
            console.error(message, data);
            self.network.onSocketError(message + JSON.stringify(data));
          });
        });
      });

      self.peer.on("disconnected", (conn) => {
        console.log("Connection lost. Please reconnect", conn);
      });

      self.peer.on("close", () => {
        const message = "Peer connection closed";
        console.log(message);
        self.network.onDisconnect(message);
      });

      self.peer.on("error", (err) => {
        console.error(err);
        self.network.onSocketError(err);
      });
    });
  }
}
