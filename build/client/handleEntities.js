"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEntities = void 0;
const ncontext_1 = require("../common/ncontext");
const Entity_1 = require("../common/Entity");
const CollisionService_1 = require("../common/CollisionService");
const Constants_1 = require("../common/Constants");
let lastTime;
const entitiesThatNeedColliderUpdate = new Map();
/**
 * Creates and synchronizes entities being from the nengi instance with the pixi renderer
 * @param interpolator
 * @param state
 * @param renderer
 */
function handleEntities(interpolator, state, renderer) {
    const istate = interpolator.getInterpolatedState(Constants_1.INTERPOLATION_DELAY);
    // changes in entities (create, update, delete)
    istate.forEach((snapshot) => {
        snapshot.createEntities.forEach((entity) => {
            //console.log('create', entity)
            if (entity.ntype === ncontext_1.NType.Channel) {
                console.log("channel entity!", entity);
            }
            if (entity.ntype === ncontext_1.NType.Entity) {
                console.log("newEntity", entity);
                const newEntity = new Entity_1.Entity(entity);
                renderer.addEntity(newEntity);
                CollisionService_1.collisionService.insert(newEntity);
                CollisionService_1.collisionService.insert(newEntity);
                state.entities.set(newEntity.nid, newEntity);
            }
            if (entity.ntype === ncontext_1.NType.StatsEntity) {
                renderer.renderStats(entity);
                state.stats.set(entity.nid, entity);
            }
        });
        entitiesThatNeedColliderUpdate.clear();
        snapshot.updateEntities.forEach((diff) => {
            const { nid, prop, value } = diff;
            let entity = state.entities.get(nid);
            if (entity === undefined) {
                entity = state.stats.get(nid);
            }
            if (entity) {
                if (state.isPredictionEnabled && state.myId === nid) {
                    renderer.updateLocalPlayerGhost(prop, value);
                    return; // skip applying this state to the entity, we are predicting it instead
                }
                if (entity.ntype === ncontext_1.NType.Entity) {
                    if (prop === "sx") {
                        entity.x = value;
                        const collider = entity.collider;
                        collider.setPosition(value, collider.y);
                        entitiesThatNeedColliderUpdate.set(entity.nid, true);
                    }
                    else if (prop === "sy") {
                        entity.y = value;
                        const collider = entity.collider;
                        collider.setPosition(collider.x, value);
                        entitiesThatNeedColliderUpdate.set(entity.nid, true);
                    }
                }
                else if (entity.ntype === ncontext_1.NType.StatsEntity) {
                    // @ts-ignore
                    entity[prop] = value;
                    renderer.renderStats(entity);
                }
            }
            else {
                console.log(`Unexpected entity data: | nid: ${nid} prop: ${prop} value: ${value}`);
            }
        });
        // update colliders only once for each entity that was changed
        entitiesThatNeedColliderUpdate.forEach((_, nid) => {
            let entity = state.entities.get(nid);
            if (entity) {
                entity.collider.updateBody();
            }
        });
        snapshot.deleteEntities.forEach((nid) => {
            if (state.entities.has(nid)) {
                const entity = state.entities.get(nid);
                CollisionService_1.collisionService.insert(entity);
                renderer.removeEntity(entity);
            }
            state.entities.delete(nid);
        });
    });
}
exports.handleEntities = handleEntities;
