import { v4 as uuidv4 } from 'uuid';

enum BridgeCallType {
  NONE = 'NONE',
  ASYNC = 'ASYNC',
  LISTENER = 'LISTENER',
}

class BridgeCall<T> {
  readonly id: BridgeCallId = uuidv4();
  readonly name: string;
  data: BridgeCallData<T> = null;
  readonly type: BridgeCallType = BridgeCallType.NONE;
  readonly successful = false;
  constructor(name: string) {
    this.name = name;
  }
}

class AsyncBridgeCall<T> extends BridgeCall<T> {
  readonly type = BridgeCallType.ASYNC;
  readonly resolve: Resolve<T>;
  readonly reject: Reject<T>;
  constructor(name: string, resolve: Resolve<T>, reject: Reject<T>) {
    super(name);
    this.resolve = resolve;
    this.reject = reject;
  }
}

class ListenerBridgeCall<T> extends BridgeCall<T> {
  readonly type = BridgeCallType.LISTENER;
  readonly listener: Listener<T>;
  constructor(name: string, listener: Listener<T>) {
    super(name);
    this.listener = listener;
  }
}

class Bridge<T> {
  private bridgeCallMap = new Map<BridgeCallId, BridgeCall<T>>();

  send(bridgeCall: BridgeCall<T>): void {
    this.bridgeCallMap.set(bridgeCall.id, bridgeCall);
    native.process(JSON.stringify(bridgeCall));
  }

  remove(id: BridgeCallId): boolean {
    return this.bridgeCallMap.delete(id);
  }

  clear(): void {
    return this.bridgeCallMap.clear();
  }

  receive(bridgeCallJson: string): boolean {
    try {
      const bridgeCall = JSON.parse(bridgeCallJson) as BridgeCall<T>;
      const call = this.bridgeCallMap.get(bridgeCall.id);
      if (call == null) return false;
      if (call instanceof AsyncBridgeCall) {
        if (bridgeCall.successful) {
          call.resolve(bridgeCall.data);
        } else {
          call.reject(bridgeCall.data);
        }
        this.remove(call.id);
      } else if (call instanceof ListenerBridgeCall) {
        call.listener(bridgeCall.data, bridgeCall.successful);
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}

const bridge = new Bridge<string>();

export class BridgePlugin {
  asyncCall(name: string, data: BridgeCallData<string> = null): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const call = new AsyncBridgeCall<string>(name, resolve, reject);
      call.data = data;
      try {
        bridge.send(call);
      } catch (error) {
        reject(error);
      }
    });
  }

  listenerCall(name: string, listener: Listener<string>, data: BridgeCallData<string> = null): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const call = new ListenerBridgeCall<string>(name, listener);
      call.data = data;
      try {
        bridge.send(call);
        resolve(call.id);
      } catch (error) {
        reject(error);
      }
    });
  }

  removeCall(id: BridgeCallId): boolean {
    return bridge.remove(id);
  }
}

window.bridge = bridge;
