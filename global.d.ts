type Listener<T> = (data: T, successful: boolean) => void;
type Resolve<T> = (data: T | PromiseLike<T>) => void;
type Reject<T> = (data: T) => void;
type BridgeCallId = string;
type BridgeCallData<T> = T | null;

interface Native {
  process(bridgeCall: string): void;
}

interface BridgeCall<T> {
  readonly id: BridgeCallId;
  readonly name: string;
  data: BridgeCallData<T>;
  readonly type: string;
  readonly successful: boolean;
}

interface BridgeInterface<T> {
  send(bridgeCall: BridgeCall<T>): void;
  remove(id: BridgeCallId): void;
  receive(bridgeCallJson: string): boolean;
}

interface GeoInterface {
  start(): Promise<string>;
  watch(listener: Listener<string>): Promise<string>;
  unwatch(id: string): void;
}

interface Window {
  bridge: BridgeInterface<string>;
  geo: GeoInterface;
}

declare const native: Native;
