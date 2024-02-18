// import SpatialStructure from "./BasicSpace";
// import { proxify, Proxy } from "./proxify";
import { RBush, Body, System } from "detect-collisions";
import { Entity } from "../../common/Entity";
import { NetworkEvent } from "nengi";

type SpatialStructure = {
  // entities: Entity[];
  // events: NetworkEvent[];
  system: RBush<Body>;
  ssystem: RBush<Body>;
};

class SpacialStructureHistorian {
  history: { [tick: number]: SpatialStructure };
  ticksToSave: number;
  tick: number;
  tickRate: number;

  constructor(tickRate: number, ticksToSave: number) {
    this.history = {};
    this.ticksToSave = ticksToSave;
    this.tick = -1;
    this.tickRate = tickRate;
  }

  getSnapshot(tick: number) {
    if (this.history[tick]) {
      return this.history[tick];
    } else {
      console.error(
        "Unable to get historical spacial structure at tick: ",
        tick
      );
      return null;
    }
  }

  getOldestSnapshot() {
    console.log(this.ticksToSave, Object.keys(this.history));
    return this.getSnapshot(this.tick - this.ticksToSave + 1);
  }

  getLatestSnapshot() {
    return this.getSnapshot(this.tick);
  }

  record(
    tick: number,
    // entities: Entity[],
    // events: NetworkEvent[],
    systemCopy: RBush<Body>,
    ssystemCopy: RBush<Body>
  ) {
    const spatialStructure: SpatialStructure = {
      // entities: [],
      // events: [],
      system: systemCopy,
      ssystem: ssystemCopy,
    };
    // for (let i = 0; i < entities.length; i++) {
    //   const entity = entities[i];
    //   spatialStructure.entities.push(entity);
    // }

    // for (let i = 0; i < events.length; i++) {
    //   const event = events[i];
    //   spatialStructure.events.push(event);
    // }

    this.history[tick] = spatialStructure;

    if (tick > this.tick) {
      this.tick = tick;
    }

    if (this.history[tick - this.ticksToSave]) {
      // this.history[tick - this.ticksToSave].release();
      delete this.history[tick - this.ticksToSave];
    }
  }

  getLagCompensatedSpacialStructure(timeAgo: number): SpatialStructure | null {
    // const tickLengthMs = 1000 / this.tickRate;
    const ticksAgo = timeAgo / this.tickRate;
    console.log("ticksAgo = ", ticksAgo);

    const olderTick = this.tick - Math.floor(ticksAgo);
    const newerTick = this.tick - Math.floor(ticksAgo) + 1;
    // const portion = (timeAgo % tickLengthMs) / tickLengthMs;

    const timesliceA = this.getSnapshot(olderTick);
    const timesliceB = this.getSnapshot(newerTick);

    let compensatedSpatialStructure: SpatialStructure | null;

    if (timesliceA && timesliceB) {
      // TODO: consider getting data between each point
      compensatedSpatialStructure = timesliceA;
    } else {
      console.error("Getting oldest snapshot...");
      compensatedSpatialStructure = this.getOldestSnapshot();
    }

    return compensatedSpatialStructure;
  }

  // getCurrentState() {
  //   return this.getSnapshot(this.tick);
  // }

  // getRecentEvents() {
  //   const spatialStructure = this.getSnapshot(this.tick);
  // }

  // getRecentSnapshot() {
  //   return this.getSnapshot(this.tick);
  // }
}

export default SpacialStructureHistorian;
