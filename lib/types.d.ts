export declare type Resolve<T> = (data: T | PromiseLike<T>) => void;
export declare type Reject<T> = (data: T) => void;
export declare type BridgeCallId = string;
export declare type BridgeCallData = string | null;
export declare type Listener<T> = (data: T, successful: boolean) => void;
interface Native {
    process(bridgeCall: string): void;
}
export declare const native: Native;
export {};
