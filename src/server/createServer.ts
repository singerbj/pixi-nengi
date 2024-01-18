import {
  Instance,
  NetworkEvent,
  AABB2D,
  Channel,
  User,
  InstanceNetwork,
} from "nengi";
import { NType, ncontext } from "../common/ncontext";
import { uWebSocketsInstanceAdapter } from "nengi-uws-instance-adapter";
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
import Historian from "./historian/Historian";
import lagCompensatedHitscanCheck from "./lagCompensatedHitscanCheck";
import { ShotMessage } from "../common/ShotMessage";
import { getMap } from "../common/MapService";
import { authenticateUser } from "./authenticateUser";
import { PeerJSAdapter } from "../client/PeerJSAdapter";

export const P2P_SERVER_TYPE = "p2p";
export const AUTHORITATIVE_SERVER_TYPE = "authoritative_server";

interface IuWebSocketsInstanceAdapter {
  new (network: InstanceNetwork, config: any): uWebSocketsInstanceAdapter;
}

export type P2PServerOptions = {
  type: "p2p";
  adapter: PeerJSAdapter;
  peerId: string;
};

export type AuthoritativeServerOptions = {
  type: "authoritative_server";
  adapter: IuWebSocketsInstanceAdapter;
  port: number;
};

export type ServerOptions = P2PServerOptions | AuthoritativeServerOptions;

export const createServer = (serverOptions: ServerOptions) => {
  const instance = new Instance(ncontext);

  if (serverOptions.type === AUTHORITATIVE_SERVER_TYPE) {
    const uws = new serverOptions.adapter(instance.network, {});
    uws.listen(serverOptions.port, () => {
      console.log(`uws adapter is listening on ${serverOptions.port}`);
    });
  } else {
    serverOptions.adapter.registerAsServer(instance.network, {});
  }
  instance.onConnect = authenticateUser;

  const mainChannel = new Channel(instance.localState);

  const queue = instance.queue;
  type MyUser = User & { entity: any; view: AABB2D }; // view is currently not used

  const stats = new StatsEntity();
  mainChannel.addEntity(stats);

  const entityMap = new Map<number, Entity>();
  const entityUserMap = new Map<number, User>();

  let entityInputs: { entity: Entity; command: any; user: User | null }[] = [];
  const entitiesWithInput = new Map<number, boolean>();

  const historian = new Historian(TICK_RATE, HISTORIAN_TICKS, "nid");

  // load the map in the collision service
  const map = getMap();
  collisionService.registerMap(map);

  const update = (delta: number) => {
    entityInputs = [];
    entitiesWithInput.clear();
    while (!queue.isEmpty()) {
      const networkEvent = queue.next();

      // disconnections
      if (networkEvent.type === NetworkEvent.UserDisconnected) {
        const user = networkEvent.user as MyUser;
        const entity = user.entity;
        entityMap.delete(entity.nid);
        entityUserMap.delete(entity.nid);
        collisionService.remove(entity.collider);
        mainChannel.removeEntity(entity);
      }

      // connections
      if (networkEvent.type === NetworkEvent.UserConnected) {
        const user = networkEvent.user as MyUser;
        mainChannel.subscribe(user);
        const entity = new Entity();
        collisionService.insert(entity.collider);

        // set random spawn position
        // TODO: Improve this to be like, fair and stuff
        entity.x = rand(-300, 300);
        entity.y = rand(250, 400);

        entity.updateColliderFromPosition();

        user.entity = entity;
        mainChannel.addEntity(entity);
        if (entity.collider.customOptions !== undefined) {
          entity.collider.customOptions.nid = entity.nid;
        }
        entityMap.set(entity.nid, entity);
        entityUserMap.set(entity.nid, user);
        user.queueMessage(new IdentityMessage(entity.nid));
        // console.log("connected", { user });
      }

      // user input
      if (networkEvent.type === NetworkEvent.CommandSet) {
        const { user, commands, clientTick } = networkEvent;
        const { entity, view } = user as MyUser;

        commands.forEach((command: any) => {
          if (command.ntype === NType.InputCommand) {
            // handleInput(entity, command);
            entityInputs.push({ entity, command, user });
            entitiesWithInput.set(entity.nid, true);
          }
        });
      }
    }

    //////////////////////////
    // game logic goes here //
    //////////////////////////

    // entityMap.forEach((entity, nid) => {
    //   entity.y += ENTITY_SPEED * delta;
    // });

    // TODO: I think this technically works. But visually it looks bad
    //       I need to add the smooth and raw representations of the player on the server I think to help with this
    //       Maybe I can just remember the locations of the previous frame and send n frames in the past to the client or something?
    //       ...and then do collision stuff based on that smooth representation rather than the raw? (and shooting eventually)
    entityMap.forEach((entity, nid) => {
      if (entitiesWithInput.get(nid) === undefined) {
        entityInputs.push({
          entity,
          command: new InputCommand(delta),
          user: null,
        });
      }
    });

    let shotReports: ShotMessage[] = [];
    entityInputs.forEach(({ entity, command, user }) => {
      const [shooting, shotMessage] = handleInput(entity, command);
      if (user !== null && shooting) {
        const timeAgo = user.latency + INTERPOLATION_DELAY;
        shotReports = shotReports.concat(
          lagCompensatedHitscanCheck(
            historian,
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
      mainChannel.users.forEach((user) => {
        // const userFromMap = entityUserMap.get(shotReport.shooterId);
        // if (userFromMap && userFromMap.id !== user.id) {
        user.queueMessage(shotReport);
        // }
      });
    });

    // save the final list of entities for the historian
    const entities: Entity[] = [];
    entityMap.forEach((entity) => {
      entity.positions.push({ x: entity.x, y: entity.y });
      followPath(entity, delta);
      entities.push(entity);
    });

    // stats compilation
    stats.entityCount = instance.localState._entities.size;
    stats.userCount = instance.users.size;

    // lagCompensatedHitscanCheck(historian, 500);

    // record state with historian
    historian.record(instance.tick, entities, []);

    instance.step();
  };

  let prev = performance.now();
  const loop = () => {
    setTimeout(loop, TICK_RATE);
    const start = performance.now();
    const deltaMs = start - prev;
    prev = start;
    //console.log(deltaMs)
    stats.registerDelta(deltaMs);
    update(deltaMs / 1000);
    const end = performance.now();
    const frametime = end - start;
    stats.registerCPUFrame(frametime);
    stats.cpuMillisecondsPerTick = frametime; // technically this is the previous frames' time by the time the client sees it
    // console.log(
    //   "connected clients",
    //   instance.users.size,
    //   " :: ",
    //   frametime,
    //   "time",
    //   instance.localState._entities.size
    // );
    // if (frametime >= TICK_RATE) {
    //   console.log(
    //     " ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: ",
    //     frametime,
    //     "time",
    //     instance.localState._entities.size
    //   );
    // }
  };
  loop();
};