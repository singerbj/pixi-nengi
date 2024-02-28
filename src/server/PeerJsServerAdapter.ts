import { Buffer } from "buffer";
import { IServerNetworkAdapter, User, InstanceNetwork, Context } from "nengi";
import { BufferReader, BufferWriter } from "nengi-buffers";
import {
  HOST_ID_LENGTH,
  TEMP_SERVER_ID_FOR_TESTING,
} from "../common/Constants";
import { Peer, DataConnection } from "peerjs";

const ALWAYS_BINARY = { binary: true };

export class PeerJsServerAdapter implements IServerNetworkAdapter {
  network: InstanceNetwork;
  context: Context;
  peer: Peer | undefined;

  constructor(network: InstanceNetwork, config: any) {
    this.network = network;
    this.context = this.network.instance.context;
  }

  private makeid = (length: number) => {
    // var result = "";
    // var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // var charactersLength = characters.length;
    // for (var i = 0; i < length; i++) {
    //   result += characters.charAt(Math.floor(Math.random() * charactersLength));
    // }
    // return result;

    return TEMP_SERVER_ID_FOR_TESTING;
  };

  // consider a promise?
  listen(_port: number, ready: () => void) {
    const self = this;

    var serverId = this.makeid(HOST_ID_LENGTH);
    this.peer = new Peer(serverId, { debug: 2, host: "0.0.0.0", port: 9002 });

    console.log(`Creating PeerJs server with id: ${serverId}`);
    this.peer.on("open", (id) => {
      console.log("Server is awaiting connections!");
      ready();
    });

    this.peer.on("connection", (conn: DataConnection) => {
      const user = new User(conn, self);
      user.socket = conn;
      self.network.onOpen(user);
      console.log("uer created", user);

      conn.on("data", (data) => {
        // console.log("data recieved from " + conn.peer + ":", data);
        // // @ts-ignore
        // const binaryReader = new BufferReader(data);
        // self.network.onMessage(user, binaryReader.buffer);
        // @ts-ignore
        this.network.onMessage(user, Buffer.from(data));
      });
      conn.on("close", () => {
        console.log("close (conn) " + conn.peer);
        self.network.onClose(user);
      });
      conn.on("error", (data) => {
        console.log("error (conn) " + conn.peer + ":", data);
      });
    });

    this.peer.on("disconnected", (conn) => {
      console.log("Connection lost. Please reconnect", conn);
    });

    this.peer.on("close", () => {
      console.log("Peer connection closed");
    });

    this.peer.on("error", (err) => {
      console.error(err);
    });
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

  disconnect(user: User, reason: any): void {
    user.socket.end(1000, JSON.stringify(reason));
  }

  send(user: User, buffer: Buffer): void {
    user.socket.send(buffer, true);
  }
}
