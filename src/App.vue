<template>
    <div>
        <h1>{{ data }}</h1>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { delay, launch } from "./common/helpers";
import { Bridge, BridgePlugin } from "./lib/bridge";
import { BridgeCallData, BridgeCallId, Listener } from "./lib/types";

const data = ref("loading")

window.bridge = new Bridge();

class App extends BridgePlugin {
    async watch(block: (data: string, successful: boolean, error: Error) => void) {
        return this.listenerCall("app.watch", <Listener<BridgeCallData>>block);
    }
    async unwatch(id: BridgeCallId) {
        return this.removeCall(id);
    }
    async info() {
        return this.asyncCall("app.info");
    }
}

const app = new App(window.bridge);

onMounted(async () => {
    try {
        const watchId = await app.watch((_data, _, error) => {
            data.value = _data || "lwatch" + error.message;
        });

        launch(async () => {
            await delay(10000);
            app.unwatch(watchId);
        });
    } catch(error) {
        data.value = "watch" + (<Error>error).message;
    }

    // try {
    //     data.value = <string>await app.info();
    // } catch(error) {
    //     data.value = "info" + (<Error>error).message;
    // }
})
</script>