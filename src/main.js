import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import '../node_modules/quill/dist/quill.bubble.css';
import '../node_modules/quill/dist/quill.snow.css';
import '../node_modules/quill/dist/quill.core.css';

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
