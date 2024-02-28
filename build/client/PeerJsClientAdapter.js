"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerJSClientAdapter = void 0;
const nengi_1 = require("nengi");
const nengi_dataviews_1 = require("nengi-dataviews");
const peerjs_1 = require("peerjs");
class PeerJSClientAdapter {
    constructor(network, config) {
        this.authenticated = false;
        this.network = network;
        this.context = this.network.client.context;
    }
    flush() {
        const buffer = this.network.createOutboundBuffer(nengi_dataviews_1.DataViewWriter);
        if (this.conn) {
            this.conn.send(buffer);
        }
        else {
            console.error("No connection established, not flushing");
        }
    }
    connect(serverId, handshake) {
        const self = this;
        return new Promise((resolve, reject) => {
            // @ts-ignore
            self.peer = new peerjs_1.Peer(null, {
                debug: 2,
                host: "localhost",
                port: 9002,
            });
            self.peer.on("open", (id) => {
                self.conn = self.peer.connect(serverId);
                console.log(`Connecting to PeerJs server with id: ${serverId}`);
                self.conn.on("open", () => {
                    console.log("Client is connected to server!");
                    self.conn.send(self.network.createHandshakeBuffer(handshake, nengi_dataviews_1.DataViewWriter));
                    self.conn.on("data", (data) => {
                        // console.log("data recieved from " + self.conn!.peer + ":", data);
                        // initially the only thing we care to read is a response to our handshake
                        // we don't even setup the parser for the rest of what a nengi client can receive
                        const dr = new nengi_dataviews_1.DataViewReader(data, 0);
                        const type = dr.readUInt8(); // type of message
                        if (self.authenticated === false) {
                            if (type === nengi_1.BinarySection.EngineMessages) {
                                const count = dr.readUInt8(); // quantity of engine messages
                                const connectionResponseByte = dr.readUInt8();
                                if (connectionResponseByte === nengi_1.EngineMessage.ConnectionAccepted) {
                                    self.authenticated = true;
                                    resolve("accepted");
                                }
                                if (connectionResponseByte === nengi_1.EngineMessage.ConnectionDenied) {
                                    const denyReason = JSON.parse(dr.readString());
                                    reject(denyReason);
                                }
                            }
                        }
                        else {
                            // setup listeners for normal game data
                            const dr = new nengi_dataviews_1.DataViewReader(data, 0);
                            self.network.readSnapshot(dr);
                        }
                    });
                    self.conn.on("close", () => {
                        const message = "close (conn) " + self.conn.peer;
                        console.log(message);
                        self.network.onDisconnect(message);
                    });
                    self.conn.on("error", (data) => {
                        const message = "error (conn) " + self.conn.peer + ": ";
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
exports.PeerJSClientAdapter = PeerJSClientAdapter;
