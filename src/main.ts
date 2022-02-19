import { BridgePlugin } from './bridge';

class Geo extends BridgePlugin {
  async start() {
    return this.asyncCall('geo.start');
  }
  async watch(listener: Listener<string>) {
    return this.listenerCall('geo.watch', listener);
  }
  unwatch(id: BridgeCallId) {
    return this.removeCall(id);
  }
}

const geo = new Geo();

window.addEventListener('load', async () => {
  // const id = await geo.watch((data) => {
  //   console.log(`data from native ${data}`);
  // });

  console.log(await geo.start());

  // setTimeout(() => {
  //   geo.unwatch(id);
  // }, 2000);
});
