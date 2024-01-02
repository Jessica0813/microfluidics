import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const app = createApp(App)

const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi'
    },
    defaults: {
      global: {
        ripple: false
      },
      VBtn: {
        style: [{ textTransform: 'none', letterSpacing: '0' }]
      }
    }
  })
  
app.use(vuetify)

app.use(createPinia())

app.mount('#app')
