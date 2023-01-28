import { Bridge, BridgePlugin } from "./bridge";
import { delay, launch } from "./helpers";

window.native = {
  process(bridgeCallJson) {
    const call = JSON.parse(bridgeCallJson);
    switch (call.name) {
      case "app.info":
        launch(async () => {
          await delay(10000);
          call.data = "App Information";
          call.successful = true;
          window.bridge.receive(JSON.stringify(call));
        });
        break;
      default:
        break;
    }
    return true;
  },
};

window.bridge = new Bridge();

class App extends BridgePlugin {
  async info() {
    return this.asyncCall("app.info");
  }
}

const app = new App(window.bridge);

launch(async () => {
  console.log(await app.info());
});
