# Typescript

TypeScript project structure.

#### Install Packages

```
yarn
```

#### Start Development Server

```
yarn serve
```

#### Production Build

```
yarn build
```

import { Bridge, BridgeCallData, BridgeCallId, BridgePlugin } from './bridge';

const bridge = new Bridge();
class Geo extends BridgePlugin {
constructor() {
super(bridge);
}
async start() {
return this.asyncCall('geo.start');
}
async watch(listener: Listener<BridgeCallData>) {
return this.listenerCall('geo.watch', listener);
}
unwatch(id: BridgeCallId) {
return this.removeCall(id);
}
}

const geo = new Geo();

window.addEventListener('load', async () => {
await geo.watch((data) => {
console.log(`data from native ${data}`);
});

console.log(await geo.start());

// setTimeout(() => {
// geo.unwatch(id);
// }, 2000);
});

export default bridge;
