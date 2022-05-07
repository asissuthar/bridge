"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgePlugin = exports.Bridge = void 0;
const uuid_1 = require("uuid");
var BridgeCallType;
(function (BridgeCallType) {
    BridgeCallType["NONE"] = "NONE";
    BridgeCallType["ASYNC"] = "ASYNC";
    BridgeCallType["LISTENER"] = "LISTENER";
})(BridgeCallType || (BridgeCallType = {}));
class BridgeCall {
    constructor(name) {
        this.id = (0, uuid_1.v4)();
        this.data = null;
        this.type = BridgeCallType.NONE;
        this.successful = false;
        this.name = name;
    }
}
class AsyncBridgeCall extends BridgeCall {
    constructor(name, resolve, reject) {
        super(name);
        this.type = BridgeCallType.ASYNC;
        this.resolve = resolve;
        this.reject = reject;
    }
}
class ListenerBridgeCall extends BridgeCall {
    constructor(name, listener) {
        super(name);
        this.type = BridgeCallType.LISTENER;
        this.listener = listener;
    }
}
class Bridge {
    constructor() {
        this.bridgeCallMap = new Map();
    }
    send(bridgeCall) {
        this.bridgeCallMap.set(bridgeCall.id, bridgeCall);
        // eslint-disable-next-line no-prototype-builtins
        if (window.hasOwnProperty("native")) {
            try {
                if (!window["native"].process(JSON.stringify(bridgeCall))) {
                    this.remove(bridgeCall.id);
                    throw new Error("bridge inactive");
                }
            }
            catch (error) {
                this.remove(bridgeCall.id);
                throw error;
            }
        }
        else {
            this.remove(bridgeCall.id);
            throw new Error("bridge unavailable");
        }
    }
    remove(id) {
        return this.bridgeCallMap.delete(id);
    }
    clear() {
        return this.bridgeCallMap.clear();
    }
    canReceive(bridgeCallId) {
        return this.bridgeCallMap.has(bridgeCallId);
    }
    receive(bridgeCallJson) {
        try {
            const bridgeCall = JSON.parse(bridgeCallJson);
            const call = this.bridgeCallMap.get(bridgeCall.id);
            if (call === undefined)
                return false;
            if (call instanceof AsyncBridgeCall) {
                if (bridgeCall.successful) {
                    call.resolve(bridgeCall.data);
                }
                else {
                    call.reject(bridgeCall.data);
                }
                this.remove(call.id);
            }
            else if (call instanceof ListenerBridgeCall) {
                call.listener(bridgeCall.data, bridgeCall.successful);
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.Bridge = Bridge;
class BridgePlugin {
    constructor(bridge) {
        this.bridge = bridge;
    }
    asyncCall(name, data = null) {
        return new Promise((resolve, reject) => {
            const call = new AsyncBridgeCall(name, resolve, reject);
            call.data = data;
            try {
                this.bridge.send(call);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    listenerCall(name, listener, data = null) {
        return new Promise((resolve, reject) => {
            const call = new ListenerBridgeCall(name, listener);
            call.data = data;
            try {
                this.bridge.send(call);
                resolve(call.id);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    removeCall(id) {
        return this.bridge.remove(id);
    }
}
exports.BridgePlugin = BridgePlugin;
