import {
  EngineMessage,
  BinarySection,
  ClientNetwork,
  Context,
  InstanceNetwork,
  IServerNetworkAdapter,
  IBinaryReader,
  IBinaryWriter,
  User,
} from "nengi";
import { DataConnection, Peer } from "peerjs";
import { BufferReader, BufferWriter } from "nengi-buffers";

class PeerJSAdapter implements IServerNetworkAdapter {
  isServer = false;
  peer: Peer | null;
  conn: DataConnection | null;
  authenticated: boolean;
  clientNetwork: ClientNetwork;
  clientContext: Context;

  serverNetwork: InstanceNetwork;
  serverContext: Context;

  constructor(
    clientNetwork: ClientNetwork,
    serverNetwork: InstanceNetwork,
    config: any
  ) {
    this.peer = null;
    this.conn = null;
    this.authenticated = false;
    this.clientNetwork = clientNetwork;
    this.clientContext = this.clientNetwork.client.context;

    this.serverNetwork = serverNetwork;
    this.serverContext = this.serverNetwork.instance.context;
  }

  ////////////////////
  // Client methods //
  ////////////////////

  flush() {
    if (!this.peer || !this.conn) {
      console.error("No peer or connection open", this.peer, this.conn);
      return;
    }

    const buffer = this.clientNetwork.createOutboundBuffer(BufferWriter);
    this.conn.send(buffer);
  }

  connect(peerId: string, handshake: any, hosting = true) {
    console.log("Attempting connection to", peerId, hosting);
    var self = this;
    return new Promise((resolve, reject) => {
      const formattedPeerId = `pixi-nengi-` + peerId;
      // @ts-ignore
      this.peer = new Peer(hosting ? formattedPeerId : null, {
        debug: 3,
      });
      this.peer.on("connection", (conn) => {
        console.log("PeerJS connection", conn);

        if (this.isServer) {
          const user = new User(conn, self);
          //@ts-ignore
          conn.user = user;
          // user.remoteAddress = Buffer.from(
          //   ws.getRemoteAddressAsText()
          // ).toString("utf8");
          self.serverNetwork.onOpen(user);
        }
      });
      this.peer.on("disconnected", function (conn) {
        console.log("Connection lost. Please reconnect", conn);
        self.peer = null;
        self.conn = null;
      });
      this.peer.on("close", function () {
        console.log("Connection destroyed");
        self.peer = null;
        self.conn = null;
      });
      this.peer.on("error", function (err) {
        console.error("----------> Connection error: ", err.message);
        if (err.message.indexOf(`ID "${formattedPeerId}" is taken`) > -1) {
          self.connect(peerId, handshake, false);
        }
      });

      this.conn = this.peer.connect(peerId);
      this.conn.on("open", () => {
        if (this.conn) {
          console.log("PeerJS connected!");
          this.conn.on("data", (data) => {
            if (!this.authenticated) {
              // initially the only thing we care to read is a response to our handshake
              // we don't even setup the parser for the rest of what a nengi client can receive
              // @ts-ignore
              const dr = new BufferReader(Buffer.from(data));
              const type = dr.readUInt8(); // type of message
              if (type === BinarySection.EngineMessages) {
                const count = dr.readUInt8(); // quantity of engine messages
                const connectionResponseByte = dr.readUInt8();
                if (
                  connectionResponseByte === EngineMessage.ConnectionAccepted
                ) {
                  this.authenticated = true;
                  resolve("accepted");
                }
                if (connectionResponseByte === EngineMessage.ConnectionDenied) {
                  const denyReason = JSON.parse(dr.readString());
                  self.conn && self.conn.close();
                  reject(denyReason);
                }
              }
            } else {
              // @ts-ignore
              const dr = new BufferReader(Buffer.from(data));
              this.clientNetwork.readSnapshot(dr);

              if (self.isServer) {
                //@ts-ignore
                const user = self.conn.user;
                self.serverNetwork.onMessage(user, Buffer.from(data));
              }
            }
          });
          this.conn.on("close", () => {
            console.warn("close (conn) " + (self.conn && self.conn.peer));
            self.peer = null;
            self.conn = null;
          });
          this.conn.on("error", (data) => {
            console.error(
              "error (conn) " + (self.conn && self.conn.peer) + ":",
              data
            );
            self.peer = null;
            self.conn = null;
          });
        }
      });
    });
  }

  ////////////////////
  // Server methods //
  ////////////////////

  registerAsServer(network: InstanceNetwork, config: any) {
    this.isServer = true;
    this.serverNetwork = network;
    this.serverContext = this.serverNetwork.instance.context;
  }

  // // consider a promise?
  listen(_port: number, _ready: () => void) {
    console.warn("This listen method does nothing...");
    // App({})
    //   .ws("/*", {
    //     //idleTimeout: 30,
    //     //maxBackpressure: 1024,
    //     //maxPayloadLength: 512,
    //     open: async (ws: WebSocket<UserData>) => {
    //       const user = new User(ws, this);
    //       ws.getUserData().user = user;
    //       user.remoteAddress = Buffer.from(
    //         ws.getRemoteAddressAsText()
    //       ).toString("utf8");
    //       this.network.onOpen(user);
    //     },
    //     message: async (
    //       ws: WebSocket<UserData>,
    //       message: any,
    //       isBinary: boolean
    //     ) => {
    //       const user = ws.getUserData().user;
    //       if (isBinary) {
    //         this.network.onMessage(user, Buffer.from(message));
    //       }
    //     },
    //     drain: (ws: WebSocket<UserData>) => {
    //       console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    //     },
    //     close: (
    //       ws: WebSocket<UserData>,
    //       code: number,
    //       message: ArrayBuffer
    //     ) => {
    //       this.network.onClose(ws.getUserData().user);
    //     },
    //   })
    //   .listen(port, (listenSocket: any) => {
    //     if (listenSocket) {
    //       ready();
    //     }
    //   });
  }

  createBuffer(lengthInBytes: number) {
    return Buffer.allocUnsafe(lengthInBytes);
  }

  createBufferWriter(lengthInBytes: number) {
    return new BufferWriter(this.createBuffer(lengthInBytes));
  }

  createBufferReader(buffer: Buffer) {
    return new BufferReader(buffer);
  }

  disconnect(user: User): void {
    (user.socket as DataConnection).close();
  }

  send(user: User, buffer: Buffer): void {
    (user.socket as DataConnection).send(buffer, true);
  }
}

export { PeerJSAdapter };
