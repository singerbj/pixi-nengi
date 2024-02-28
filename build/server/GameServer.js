"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameServer = exports.ServerState = void 0;
const nengi_1 = require("nengi");
const ncontext_1 = require("../common/ncontext");
const Entity_1 = require("../common/Entity");
const IdentityMessage_1 = require("../common/IdentityMessage");
const handleInput_1 = require("../common/handleInput");
const StatsEntity_1 = require("../common/StatsEntity");
const Util_1 = require("../common/Util");
const CollisionService_1 = require("../common/CollisionService");
const Constants_1 = require("../common/Constants");
const InputCommand_1 = require("../common/InputCommand");
const followPath_1 = require("./followPath");
const lagCompensatedHitscanCheck_1 = require("./lagCompensatedHitscanCheck");
const MapService_1 = require("../common/MapService");
var ServerState;
(function (ServerState) {
    ServerState[ServerState["Running"] = 0] = "Running";
    ServerState[ServerState["Stopped"] = 1] = "Stopped";
})(ServerState || (exports.ServerState = ServerState = {}));
class GameServer {
    constructor({ adapterClass, port }) {
        this.serverState = ServerState.Stopped;
        this.map = (0, MapService_1.getMap)();
        this.stats = new StatsEntity_1.StatsEntity();
        this.entityMap = new Map();
        this.entityUserMap = new Map();
        this.entityInputs = [];
        this.entitiesWithInput = new Map();
        this.update = (delta) => {
            this.entityInputs = [];
            this.entitiesWithInput.clear();
            while (!this.instance.queue.isEmpty()) {
                const networkEvent = this.instance.queue.next();
                // disconnections
                if (networkEvent.type === nengi_1.NetworkEvent.UserDisconnected) {
                    const user = networkEvent.user;
                    const entity = user.entity;
                    this.entityMap.delete(entity.nid);
                    this.entityUserMap.delete(entity.nid);
                    CollisionService_1.collisionService.remove(entity);
                    this.mainChannel.removeEntity(entity);
                }
                // connections
                if (networkEvent.type === nengi_1.NetworkEvent.UserConnected) {
                    const user = networkEvent.user;
                    this.mainChannel.subscribe(user);
                    const entity = new Entity_1.Entity();
                    CollisionService_1.collisionService.insert(entity);
                    // set random spawn position
                    // TODO: Improve this to be like, fair and stuff
                    entity.x = (0, Util_1.rand)(-300, 300);
                    entity.y = (0, Util_1.rand)(250, 400);
                    entity.updateColliderFromPosition();
                    user.entity = entity;
                    this.mainChannel.addEntity(entity);
                    entity.updateColliderCustomOptions();
                    this.entityMap.set(entity.nid, entity);
                    this.entityUserMap.set(entity.nid, user);
                    user.queueMessage(new IdentityMessage_1.IdentityMessage(entity.nid));
                }
                // user input
                if (networkEvent.type === nengi_1.NetworkEvent.CommandSet) {
                    const { user, commands, clientTick } = networkEvent;
                    const { entity, view } = user;
                    commands.forEach((command) => {
                        if (command.ntype === ncontext_1.NType.InputCommand) {
                            // handleInput(entity, command);
                            this.entityInputs.push({ entity, command, user });
                            this.entitiesWithInput.set(entity.nid, true);
                        }
                    });
                }
            }
            //////////////////////////
            // game logic goes here //
            //////////////////////////
            // TODO: I think this technically works. But visually it looks bad
            //       I need to add the smooth and raw representations of the player on the server I think to help with this
            //       Maybe I can just remember the locations of the previous frame and send n frames in the past to the client or something?
            //       ...and then do collision stuff based on that smooth representation rather than the raw? (and shooting eventually)
            this.entityMap.forEach((entity, nid) => {
                if (this.entitiesWithInput.get(nid) === undefined) {
                    this.entityInputs.push({
                        entity,
                        command: new InputCommand_1.InputCommand(delta),
                        user: null,
                    });
                }
            });
            let shotReports = [];
            this.entityInputs.forEach(({ entity, command, user }) => {
                const [shooting, shotMessage] = (0, handleInput_1.handleInput)(entity, command);
                if (user !== null && shooting) {
                    const timeAgo = Constants_1.INTERPOLATION_DELAY - user.latency; // Pretty sure this is correct after like wayyyy to much testing
                    shotReports = shotReports.concat((0, lagCompensatedHitscanCheck_1.lagCompensatedHitscanCheck)(this.historian, entity.nid, timeAgo, shotMessage.originX + Constants_1.PLAYER_WIDTH / 2, shotMessage.originY + Constants_1.PLAYER_HEIGHT / 2, shotMessage.targetX, shotMessage.targetY, [entity.nid]));
                }
            });
            // report shots from users to the other users
            shotReports.forEach((shotReport) => {
                this.mainChannel.users.forEach((user) => {
                    // const userFromMap = entityUserMap.get(shotReport.shooterId);
                    // if (userFromMap && userFromMap.id !== user.id) {
                    user.queueMessage(shotReport);
                    // }
                });
            });
            // TODO: or don't? save the final list of entities for the historian
            // const entities: Entity[] = [];
            this.entityMap.forEach((entity) => {
                // save the raw position so that we can create the smooth ones
                entity.positions.push({ x: entity.x, y: entity.y });
                // create the smooth ones
                (0, followPath_1.followPath)(entity, delta);
                // entities.push(entity);
            });
            // stats compilation
            this.stats.entityCount = this.instance.localState._entities.size;
            this.stats.userCount = this.instance.users.size;
            this.instance.step();
        };
        this.start = () => {
            this.serverState = ServerState.Running;
            let prev = performance.now();
            const loop = () => {
                const start = performance.now();
                const deltaMs = start - prev;
                prev = start;
                this.stats.registerDelta(deltaMs);
                this.update(deltaMs / 1000);
                const end = performance.now();
                const frametime = end - start;
                this.stats.registerCPUFrame(frametime);
                this.stats.cpuMillisecondsPerTick = frametime; // technically this is the previous frames' time by the time the client sees it
                // this.logServerInfo(frametime);
                if (frametime < Constants_1.TICK_RATE) {
                    setTimeout(loop, Constants_1.TICK_RATE - frametime);
                }
                else {
                    setTimeout(loop, 0);
                    console.error("Warning! Frame time longer than tick rate! Frametime: ", frametime);
                }
            };
            if (this.serverState === ServerState.Running) {
                loop();
            }
        };
        this.stop = () => {
            this.serverState = ServerState.Stopped;
        };
        // mocks hitting an external service to authenticate a user
        this.authenticateUser = (handshake) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // as if the api took time to respond
                    // in reality the website portion of your game should generate an auth token
                    // which this game instance can use to get your player data (assuming a game that
                    // requires authentication and loads a persistent character)
                    if (handshake.token === 12345) {
                        // fake data, which we ignore...
                        resolve({ character: "neuron", level: 24, hp: 89 });
                    }
                    else {
                        reject("Connection denied: invalid token.");
                    }
                }, 500);
            });
        });
        this.logServerInfo = (frametime) => {
            console.log("connected clients", this.instance.users.size, " :: ", frametime, "time", this.instance.localState._entities.size);
            if (frametime >= Constants_1.TICK_RATE) {
                console.log(" ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: ", frametime, "time", this.instance.localState._entities.size);
            }
        };
        this.instance = new nengi_1.Instance(ncontext_1.ncontext);
        this.port = port;
        this.instanceAdapter = new adapterClass(this.instance.network, {});
        this.instanceAdapter.listen(port || -1, () => {
            console.log(`adapter is listening${port ? ` on ${port}` : ""}`);
        });
        this.instance.onConnect = this.authenticateUser;
        this.historian = new nengi_1.Historian(ncontext_1.ncontext, 1000 / Constants_1.TICK_RATE, Constants_1.HISTORIAN_TICKS);
        this.mainChannel = new nengi_1.Channel(this.instance.localState, this.historian);
        this.mainChannel.addEntity(this.stats);
        // load the map in the collision service
        CollisionService_1.collisionService.registerMap(this.map);
    }
}
exports.GameServer = GameServer;
