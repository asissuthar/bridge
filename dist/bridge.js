var f = Object.defineProperty;
var g = (t, e, r) => e in t ? f(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var i = (t, e, r) => (g(t, typeof e != "symbol" ? e + "" : e, r), r);
import { v4 as p } from "uuid";
class u {
  constructor(e) {
    i(this, "id", p());
    i(this, "name");
    i(this, "data", null);
    i(this, "type", "NONE");
    i(this, "successful", !1);
    this.name = e;
  }
}
class c extends u {
  constructor(r, s, n) {
    super(r);
    i(this, "type", "ASYNC");
    i(this, "resolve");
    i(this, "reject");
    this.resolve = s, this.reject = n;
  }
}
class d extends u {
  constructor(r, s) {
    super(r);
    i(this, "type", "LISTENER");
    i(this, "listener");
    this.listener = s;
  }
}
class v extends Error {
  constructor() {
    super("BridgeInactiveError");
  }
}
class w extends Error {
  constructor() {
    super("BridgeUnavailableError");
  }
}
class o extends Error {
  constructor() {
    super("BridgeCallRemovedError");
  }
}
class E {
  constructor(e = "native") {
    i(this, "bridgeCallMap", /* @__PURE__ */ new Map());
    this.connector = e;
  }
  send(e) {
    if (this.bridgeCallMap.set(e.id, e), window.hasOwnProperty(this.connector))
      try {
        if (!window[this.connector].process(JSON.stringify(e)))
          throw this.remove(e.id), new v();
      } catch (r) {
        throw this.remove(e.id), r;
      }
    else
      throw this.remove(e.id), new w();
  }
  remove(e, r = !0) {
    if (!r) {
      const s = this.bridgeCallMap.get(e);
      s !== void 0 && (s instanceof c ? s.reject(new o()) : s instanceof d && s.listener(null, !1, new o()));
    }
    return this.bridgeCallMap.delete(e);
  }
  clear() {
    this.bridgeCallMap.forEach((e) => {
      e instanceof c ? e.reject(new o()) : e instanceof d && e.listener(null, !1, new o());
    }), this.bridgeCallMap.clear();
  }
  canReceive(e) {
    return this.bridgeCallMap.has(e);
  }
  receive(e) {
    try {
      const r = JSON.parse(e), s = this.bridgeCallMap.get(r.id);
      return s === void 0 ? !1 : (s instanceof c ? (r.successful ? s.resolve(r.data) : s.reject(r.data), this.remove(s.id)) : s instanceof d && s.listener(r.data, r.successful, null), !0);
    } catch {
      return !1;
    }
  }
}
class y {
  constructor(e) {
    this.bridge = e;
  }
  asyncCall(e, r = null) {
    return new Promise((s, n) => {
      const l = new c(e, s, n);
      l.data = r;
      try {
        this.bridge.send(l);
      } catch (a) {
        n(a);
      }
    });
  }
  listenerCall(e, r, s = null) {
    return new Promise((n, l) => {
      const a = new d(e, r);
      a.data = s;
      try {
        this.bridge.send(a), n(a.id);
      } catch (h) {
        l(h);
      }
    });
  }
  removeCall(e) {
    return this.bridge.remove(e);
  }
}
export {
  E as Bridge,
  o as BridgeCallRemovedError,
  v as BridgeInactiveError,
  y as BridgePlugin,
  w as BridgeUnavailableError
};
