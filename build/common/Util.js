"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = exports.rand = exports.getNewPointOnLineWithDistance = exports.calculateDistance = exports.lerp = void 0;
const lerp = (current, target, factor) => current * (1 - factor) + target * factor;
exports.lerp = lerp;
const calculateDistance = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return { dist: Math.sqrt(dx * dx + dy * dy), dx, dy };
};
exports.calculateDistance = calculateDistance;
const getNewPointOnLineWithDistance = (originX, originY, targetX, targetY, distance) => {
    let m = (targetY - originY) / (targetX - originX); // slope of the line
    let c = originY - m * originX; // y-intercept of the line
    let x = originX +
        (targetX < originX ? -distance : distance) / Math.sqrt(1 + Math.pow(m, 2)); // new x-coordinate
    let y = m * x + c; // new y-coordinate
    return [x, y];
};
exports.getNewPointOnLineWithDistance = getNewPointOnLineWithDistance;
const rand = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
};
exports.rand = rand;
const clamp = (number, min, max) => {
    return Math.min(Math.max(number, min), max);
};
exports.clamp = clamp;
