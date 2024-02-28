"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
class State {
    constructor() {
        this.myId = -1;
        this.isPredictionEnabled = true;
        this.entities = new Map();
        this.stats = new Map();
    }
}
exports.State = State;
