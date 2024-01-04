import { Instance, NetworkEvent, AABB2D, Channel, User } from "nengi";
import { NType, ncontext } from "../common/ncontext";
import { uWebSocketsInstanceAdapter } from "nengi-uws-instance-adapter";
import { Entity } from "../common/Entity";
import { IdentityMessage } from "../common/IdentityMessage";
import { handleInput } from "../common/handleInput";
import { StatsEntity } from "../common/StatsEntity";
import { rand } from "../common/Util";
import { collisionService } from "../common/CollisionService";
import { ENTITY_SPEED, TICK_RATE } from "../common/Constants";
import { InputCommand } from "../common/InputCommand";
import { followPath } from "./followPath";

// mocks hitting an external service to authenticate a user
const authenticateUser = async (handshake: any) => {
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

const instance = new Instance(ncontext);
// uws! node.js

const port = 9001;
const uws = new uWebSocketsInstanceAdapter(instance.network, {
  /* uws config */
});
uws.listen(port, () => {
  console.log(`uws adapter is listening on ${port}`);
});
instance.onConnect = authenticateUser;

const main = new Channel(instance.localState);

const queue = instance.queue;
type MyUser = User & { entity: any; view: AABB2D }; // view is currently not used

const stats = new StatsEntity();
main.addEntity(stats);

const entityMap = new Map<number, Entity>();
let entityInputs: { entity: Entity; command: any }[] = [];
const entitiesWithInput = new Map<number, boolean>();

// TODO: Load level

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
      collisionService.remove(entity.collider);
      main.removeEntity(entity);
    }

    // connections
    if (networkEvent.type === NetworkEvent.UserConnected) {
      const user = networkEvent.user as MyUser;
      main.subscribe(user);
      const entity = new Entity();
      collisionService.insert(entity.collider);

      // set random spawn position
      entity.x = rand(-150, 150);
      entity.y = rand(-150, 150);

      entity.updateColliderFromPosition();

      user.entity = entity;
      main.addEntity(entity);
      entityMap.set(entity.nid, entity);
      user.queueMessage(new IdentityMessage(entity.nid));
      console.log("connected", { user });
    }

    // user input

    if (networkEvent.type === NetworkEvent.CommandSet) {
      const { user, commands, clientTick } = networkEvent;
      const { entity, view } = user as MyUser;

      commands.forEach((command: any) => {
        if (command.ntype === NType.InputCommand) {
          // handleInput(entity, command);
          entityInputs.push({ entity, command });
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
      entityInputs.push({ entity, command: new InputCommand(delta) });
    }
  });
  entityInputs.forEach(({ entity, command }) => {
    handleInput(entity, command);
  });
  entityMap.forEach((entity) => {
    entity.positions.push({ x: entity.x, y: entity.y });
    followPath(entity, delta);
  });

  // // update all colliders based on entities' positions
  // entityMap.forEach((entity: Entity) => {
  //   entity.updateColliderFromPosition();
  // });
  // // resolve all collisions
  // collisionService.resolveAllCollisions();
  // // update all entity positions based on the seperated collider positions
  // entityMap.forEach((entity: Entity) => {
  //   entity.updatePositionFromCollider();
  // });

  // stats compilation
  stats.entityCount = instance.localState._entities.size;
  stats.userCount = instance.users.size;

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
