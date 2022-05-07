import { BridgeCallId, BridgeCallData, Resolve, Reject, Listener } from "./types";
import { v4 as uuidv4 } from "uuid";

enum BridgeCallType {
  NONE = "NONE",
  ASYNC = "ASYNC",
  LISTENER = "LISTENER",
}

class BridgeCall {
  readonly id: BridgeCallId = uuidv4();
  readonly name: string;
  data: BridgeCallData = null;
  readonly type: BridgeCallType = BridgeCallType.NONE;
  readonly successful = false;
  constructor(name: string) {
    this.name = name;
  }
}

class AsyncBridgeCall<T> extends BridgeCall {
  type = BridgeCallType.ASYNC;
  readonly resolve: Resolve<T>;
  readonly reject: Reject<T>;
  constructor(name: string, resolve: Resolve<T>, reject: Reject<T>) {
    super(name);
    this.resolve = resolve;
    this.reject = reject;
  }
}

class ListenerBridgeCall<T> extends BridgeCall {
  type = BridgeCallType.LISTENER;
  readonly listener: Listener<T>;
  constructor(name: string, listener: Listener<T>) {
    super(name);
    this.listener = listener;
  }
}

export class BridgeInactiveError extends Error {
  constructor() {
    super("BridgeInactiveError");
  }
}

export class BridgeUnavailableError extends Error {
  constructor() {
    super("BridgeUnavailableError");
  }
}

export class Bridge {
  private bridgeCallMap = new Map<BridgeCallId, BridgeCall>();

  send(bridgeCall: BridgeCall): void {
    this.bridgeCallMap.set(bridgeCall.id, bridgeCall);
    // eslint-disable-next-line no-prototype-builtins
    if (window.hasOwnProperty("native")) {
      try {
        if (!window["native"].process(JSON.stringify(bridgeCall))) {
          this.remove(bridgeCall.id);
          throw new BridgeInactiveError();
        }
      } catch (error) {
        this.remove(bridgeCall.id);
        throw error;
      }
    } else {
      this.remove(bridgeCall.id);
      throw new BridgeUnavailableError();
    }
  }

  remove(id: BridgeCallId): boolean {
    return this.bridgeCallMap.delete(id);
  }

  clear(): void {
    return this.bridgeCallMap.clear();
  }

  canReceive(bridgeCallId: BridgeCallId): boolean {
    return this.bridgeCallMap.has(bridgeCallId);
  }

  receive(bridgeCallJson: string): boolean {
    try {
      const bridgeCall = JSON.parse(bridgeCallJson) as BridgeCall;
      const call = this.bridgeCallMap.get(bridgeCall.id);
      if (call === undefined) return false;
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

export class BridgePlugin {
  constructor(private bridge: Bridge) {}

  asyncCall(name: string, data: BridgeCallData = null): Promise<BridgeCallData> {
    return new Promise((resolve, reject) => {
      const call = new AsyncBridgeCall(name, resolve, reject);
      call.data = data;
      try {
        this.bridge.send(call);
      } catch (error) {
        reject(error);
      }
    });
  }

  listenerCall(name: string, listener: Listener<BridgeCallData>, data: BridgeCallData = null): Promise<BridgeCallId> {
    return new Promise<string>((resolve, reject) => {
      const call = new ListenerBridgeCall(name, listener);
      call.data = data;
      try {
        this.bridge.send(call);
        resolve(call.id);
      } catch (error) {
        reject(error);
      }
    });
  }

  removeCall(id: BridgeCallId): boolean {
    return this.bridge.remove(id);
  }
}
