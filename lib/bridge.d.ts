import { BridgeCallId, BridgeCallData, Listener } from "./types";
declare enum BridgeCallType {
    NONE = "NONE",
    ASYNC = "ASYNC",
    LISTENER = "LISTENER"
}
declare class BridgeCall {
    readonly id: BridgeCallId;
    readonly name: string;
    data: BridgeCallData;
    readonly type: BridgeCallType;
    readonly successful = false;
    constructor(name: string);
}
export declare class Bridge {
    private bridgeCallMap;
    send(bridgeCall: BridgeCall): void;
    remove(id: BridgeCallId): boolean;
    clear(): void;
    receive(bridgeCallJson: string): boolean;
}
export declare class BridgePlugin {
    private bridge;
    constructor(bridge: Bridge);
    asyncCall(name: string, data?: BridgeCallData): Promise<BridgeCallData>;
    listenerCall(name: string, listener: Listener<BridgeCallData>, data?: BridgeCallData): Promise<BridgeCallId>;
    removeCall(id: BridgeCallId): boolean;
}
export {};
