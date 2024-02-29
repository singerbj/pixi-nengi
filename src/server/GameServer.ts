import {
  Instance,
  NetworkEvent,
  AABB2D,
  Channel,
  User,
  Historian,
  IServerNetworkAdapter,
  InstanceNetwork,
} from "nengi";
import { NType, ncontext } from "../common/ncontext";
import { Entity } from "../common/Entity";
import { IdentityMessage } from "../common/IdentityMessage";
import { handleInput } from "../common/handleInput";
import { StatsEntity } from "../common/StatsEntity";
import { rand } from "../common/Util";
import { collisionService } from "../common/CollisionService";
import {
  HISTORIAN_TICKS,
  INTERPOLATION_DELAY,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  TICK_RATE,
} from "../common/Constants";
import { InputCommand } from "../common/InputCommand";
import { followPath } from "./followPath";
import { lagCompensatedHitscanCheck } from "./lagCompensatedHitscanCheck";
import { ShotMessage } from "../common/ShotMessage";
import { getMap } from "../common/MapService";

export enum ServerState {
  Running,
  Stopped,
}

export type GameServerConfig = {
  adapterClass: IInstanceAdapter;
  port?: number | undefined;
};
export type MyUser = User & { entity: any; view: AABB2D }; // view is currently not used

export type EntityInputs = {
  entity: Entity;
  command: any;
  user: User | null;
}[];

interface IInstanceAdapter {
  new (network: InstanceNetwork, config: any): IServerNetworkAdapter;
}

export class GameServer {
  serverState: ServerState = ServerState.Stopped;
  instance: Instance;
  instanceAdapter: IServerNetworkAdapter | undefined;
  port: number | undefined;
  historian: Historian;
  mainChannel: Channel;
  map = getMap();

  stats = new StatsEntity();

  entityMap = new Map<number, Entity>();
  entityUserMap = new Map<number, User>();

  entityInputs: EntityInputs = [];
  entitiesWithInput = new Map<number, boolean>();

  constructor({ adapterClass, port }: GameServerConfig) {
    this.instance = new Instance(ncontext);

    this.port = port;
    this.instanceAdapter = new adapterClass(this.instance.network, {});
    this.instanceAdapter.listen(port || -1, () => {
      console.log(`adapter is listening${port ? ` on ${port}` : ""}`);
    });
    this.instance.onConnect = this.authenticateUser;

    this.historian = new Historian(ncontext, 1000 / TICK_RATE, HISTORIAN_TICKS);
    this.mainChannel = new Channel(this.instance.localState, this.historian);
    this.mainChannel.addEntity(this.stats);

    // load the map in the collision service
    collisionService.registerMap(this.map);
  }

  private update = (delta: number) => {
    this.entityInputs = [];
    this.entitiesWithInput.clear();
    while (!this.instance.queue.isEmpty()) {
      const networkEvent = this.instance.queue.next();

      // disconnections
      if (networkEvent.type === NetworkEvent.UserDisconnected) {
        const user = networkEvent.user as MyUser;
        const entity = user.entity;
        this.entityMap.delete(entity.nid);
        this.entityUserMap.delete(entity.nid);
        collisionService.remove(entity);
        this.mainChannel.removeEntity(entity);
      }

      // connections
      if (networkEvent.type === NetworkEvent.UserConnected) {
        const user = networkEvent.user as MyUser;
        this.mainChannel.subscribe(user);
        const entity = new Entity();
        collisionService.insert(entity);

        // set random spawn position
        // TODO: Improve this to be like, fair and stuff
        entity.x = rand(-300, 300);
        entity.y = rand(250, 400);

        entity.updateColliderFromPosition();

        user.entity = entity;
        this.mainChannel.addEntity(entity);

        entity.updateColliderCustomOptions();

        this.entityMap.set(entity.nid, entity);
        this.entityUserMap.set(entity.nid, user);
        user.queueMessage(new IdentityMessage(entity.nid));
      }

      // user input
      if (networkEvent.type === NetworkEvent.CommandSet) {
        const { user, commands, clientTick } = networkEvent;
        const { entity, view } = user as MyUser;

        commands.forEach((command: any) => {
          if (command.ntype === NType.InputCommand) {
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
          command: new InputCommand(delta),
          user: null,
        });
      }
    });

    let shotReports: ShotMessage[] = [];
    this.entityInputs.forEach(({ entity, command, user }) => {
      const [shooting, shotMessage] = handleInput(entity, command);
      if (user !== null && shooting) {
        const timeAgo = INTERPOLATION_DELAY - user.latency; // Pretty sure this is correct after like wayyyy to much testing
        shotReports = shotReports.concat(
          lagCompensatedHitscanCheck(
            this.historian,
            entity.nid,
            timeAgo,
            shotMessage.originX + PLAYER_WIDTH / 2,
            shotMessage.originY + PLAYER_HEIGHT / 2,
            shotMessage.targetX,
            shotMessage.targetY,
            [entity.nid]
          )
        );
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
      followPath(entity, delta);
      // entities.push(entity);
    });

    // stats compilation
    this.stats.entityCount = this.instance.localState._entities.size;
    this.stats.userCount = this.instance.users.size;

    this.instance.step();
  };

  public start = () => {
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

      if (frametime < TICK_RATE) {
        setTimeout(loop, TICK_RATE - frametime);
      } else {
        setTimeout(loop, 0);
        console.error(
          "Warning! Frame time longer than tick rate! Frametime: ",
          frametime
        );
      }
    };
    if (this.serverState === ServerState.Running) {
      loop();
    }
  };

  public stop = () => {
    this.serverState = ServerState.Stopped;
  };

  // mocks hitting an external service to authenticate a user
  private authenticateUser = async (handshake: any) => {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        // as if the api took time to respond
        // in reality the website portion of your game should generate an auth token
        // which this game instance can use to get your player data (assuming a game that
        // requires authentication and loads a persistent character)
        if (handshake.token === 12345) {
          // fake data, which we ignore...
          resolve({ character: "neuron", level: 24, hp: 89 });
        } else {
          reject("Connection denied: invalid token.");
        }
      }, 500);
    });
  };

  private logServerInfo = (frametime: number) => {
    console.log(
      "connected clients",
      this.instance.users.size,
      " :: ",
      frametime,
      "time",
      this.instance.localState._entities.size
    );
    if (frametime >= TICK_RATE) {
      console.log(
        " ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: ",
        frametime,
        "time",
        this.instance.localState._entities.size
      );
    }
  };
}
