export type Resolve<T> = (data: T | PromiseLike<T>) => void;
export type Reject<T> = (data: T) => void;
export type BridgeCallId = string;
export type BridgeCallData = string | null;
export type Listener<T> = (data: T, successful: boolean) => void;

interface Native {
  process(bridgeCall: string): void;
}

export declare const native: Native;
