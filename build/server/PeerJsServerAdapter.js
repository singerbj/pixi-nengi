"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerJsServerAdapter = void 0;
const buffer_1 = require("buffer");
const nengi_1 = require("nengi");
const nengi_buffers_1 = require("nengi-buffers");
const Constants_1 = require("../common/Constants");
const peerjs_1 = require("peerjs");
const ALWAYS_BINARY = { binary: true };
class PeerJsServerAdapter {
    constructor(network, config) {
        this.makeid = (length) => {
            // var result = "";
            // var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            // var charactersLength = characters.length;
            // for (var i = 0; i < length; i++) {
            //   result += characters.charAt(Math.floor(Math.random() * charactersLength));
            // }
            // return result;
            return Constants_1.TEMP_SERVER_ID_FOR_TESTING;
        };
        this.network = network;
        this.context = this.network.instance.context;
    }
    // consider a promise?
    listen(_port, ready) {
        const self = this;
        var serverId = this.makeid(Constants_1.HOST_ID_LENGTH);
        this.peer = new peerjs_1.Peer(serverId, { debug: 2, host: "localhost", port: 9002 });
        console.log(`Creating PeerJs server with id: ${serverId}`);
        this.peer.on("open", (id) => {
            console.log("Server is awaiting connections!");
            ready();
        });
        this.peer.on("connection", (conn) => {
            const user = new nengi_1.User(conn, self);
            user.socket = conn;
            self.network.onOpen(user);
            console.log("uer created", user);
            conn.on("data", (data) => {
                // console.log("data recieved from " + conn.peer + ":", data);
                // // @ts-ignore
                // const binaryReader = new BufferReader(data);
                // self.network.onMessage(user, binaryReader.buffer);
                // @ts-ignore
                this.network.onMessage(user, buffer_1.Buffer.from(data));
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
    createBuffer(lengthInBytes) {
        return buffer_1.Buffer.allocUnsafe(lengthInBytes);
    }
    createBufferWriter(lengthInBytes) {
        return new nengi_buffers_1.BufferWriter(this.createBuffer(lengthInBytes));
    }
    createBufferReader(buffer) {
        return new nengi_buffers_1.BufferReader(buffer);
    }
    disconnect(user, reason) {
        user.socket.end(1000, JSON.stringify(reason));
    }
    send(user, buffer) {
        user.socket.send(buffer, true);
    }
}
exports.PeerJsServerAdapter = PeerJsServerAdapter;
