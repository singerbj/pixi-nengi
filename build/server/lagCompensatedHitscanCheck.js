"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lagCompensatedHitscanCheck = void 0;
const ShotMessage_1 = require("../common/ShotMessage");
const Util_1 = require("../common/Util");
const Constants_1 = require("../common/Constants");
const CollisionService_1 = require("../common/CollisionService");
const lagCompensatedHitscanCheck = (historian, shooterId, timeAgo, originX, originY, targetX, targetY, ignoreNids = []) => {
    // Get the actual shot coordinates based on the shot distance and the user input
    const [newTargetX, newTargetY] = (0, Util_1.getNewPointOnLineWithDistance)(originX, originY, targetX, targetY, Constants_1.SHOT_DISTANCE);
    const pastEntityState = historian.getFastLagCompensatedState(timeAgo);
    if (pastEntityState) {
        const historicalSystem = CollisionService_1.collisionService.getHistoricalSystem(pastEntityState);
        //TODO: fix this somehow
        //@ts-expect-error
        const hit = historicalSystem.raycast({ x: originX, y: originY }, { x: newTargetX, y: newTargetY }, (body) => {
            //TODO: fix this somehow
            //@ts-ignore
            const nid = body.nid;
            // console.log(body);
            return nid === undefined || !ignoreNids.includes(nid);
        });
        if (hit !== null) {
            // TODO: fix this
            //@ts-ignore
            // console.log(hit.body.customOptions.nid, hit.body.customOptions.soft);
            return new ShotMessage_1.ShotMessage(shooterId, originX, originY, newTargetX, newTargetY, true, hit.point.x, hit.point.y, 
            // TODO: fix this
            //@ts-ignore
            hit.body.nid || 0);
        }
        else {
            return new ShotMessage_1.ShotMessage(shooterId, originX, originY, newTargetX, newTargetY, false, 0, 0, 0);
        }
    }
    else {
        console.error("Not enough historical frames to do hit detection!");
        return new ShotMessage_1.ShotMessage(shooterId, originX, originY, newTargetX, newTargetY, false, 0, 0, 0);
    }
};
exports.lagCompensatedHitscanCheck = lagCompensatedHitscanCheck;
