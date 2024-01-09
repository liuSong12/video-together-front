import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'vant/lib/index.css';
import * as Vant from 'vant';
import route from './router';
import "./utils/axios.config"
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createPinia } from 'pinia'
import Particles from "@tsparticles/vue3";
import { loadSlim } from "@tsparticles/slim";

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)
app.use(Particles, {
    init: async engine => {
        await loadSlim(engine);
    },
})
app.use(pinia)
app.use(Vant)
app.use(route)
app.mount('#app')
