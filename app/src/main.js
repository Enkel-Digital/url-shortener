// import "bulma";
// Load bulma styles in the main entry point
import "bulma/css/bulma.min.css";

import { auth, onAuthStateChanged } from "./firebase";

import { oof } from "simpler-fetch";

// Set baseUrl before using in actions
oof.baseUrl(
  process.env.NODE_ENV === "production"
    ? "https://short.enkeldigital.com"
    : "http://localhost:3000"
);

import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import router from "./router.js";
import App from "./App.vue";

// App variable to store reference to the vue App object
let app;

/**
 * Why new vue is wrapped in this?
 *
 * Wait for firebase to finish initialization before creating the app.
 * So that the router navigation wont break due to invalid auth
 */
const unsubscribe = onAuthStateChanged(auth, () => {
  // Prevent app initialization from running more than once
  if (!app)
    // Create new vue app
    app = createApp(App)
      .use(createPinia().use(piniaPluginPersistedstate))
      .use(router)
      .mount("#app");

  // Use the firebase.Unsubscribe function returned from adding auth state change listner to unsubscribe
  // To prevent new Vue from running more than once
  unsubscribe();
});
