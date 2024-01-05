import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'vant/lib/index.css';
import * as Vant from 'vant';
import route from './router';
import "./utils/axios.config"

import { createPinia } from 'pinia'


const app = createApp(App)

app.use(createPinia())
app.use(Vant)
app.use(route)
app.mount('#app')
