<script setup>
import { useNotif } from "./store/notif";
const notif = useNotif();
</script>

<template>
  <div class="container px-5 py-5" style="max-width: 50em">
    <!-- Conditionally show the loader based on the shared global loading flag -->
    <!-- <Loader v-if="$store.state.loading" /> -->

    <div
      v-if="notif.notif"
      class="notification is-primary is-light"
      style="
        position: sticky;
        top: 1em;
        z-index: 10;
        box-shadow: 0 0.3rem 1rem rgb(0 0 0 / 0.4);
      "
    >
      <button class="delete" @click="notif.clearNotif"></button>

      <!-- Allow HTML content to be shown -->
      <!-- Word wrap CSS added to deal with unusually long slugs on small screens -->
      <span v-html="notif.notifContent" style="word-wrap: break-word" />
    </div>

    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Color input pink if it is invalid --> e.g. when telephone number does not match the specified pattern */
/* Will only activate if the placeholder is not currently being shown, meaning will not show before user type anything */
input:not(:placeholder-shown):invalid {
  background-color: lightpink;
}
</style>
