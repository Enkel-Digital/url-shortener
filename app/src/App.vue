<script setup>
import { useNotif } from "./store/notif";
const notif = useNotif();
</script>

<template>
  <div class="container py-5" style="max-width: 50em">
    <!-- Conditionally show the loader based on the shared global loading flag -->
    <!-- <Loader v-if="$store.state.loading" /> -->

    <!-- @todo Allow caller to set color -->
    <!--
      Use a fixed position and apply overlay style so that the notification will
      not take up space on the normal plane and push everything else down.

      Max width like the top level container to match the width
    -->
    <div
      v-if="notif.notif"
      style="
        max-width: 50em;

        position: fixed;
        top: 1rem;
        z-index: 100;
        width: 100%;
      "
    >
      <!-- Only apply the box shadow to the notification bar itself -->
      <div
        class="notification is-primary is-light"
        style="box-shadow: 0 0.3rem 1rem rgb(0 0 0 / 0.4)"
      >
        <button class="delete" @click="notif.clearNotif"></button>

        <!-- Allow HTML content to be shown -->
        <!-- Word wrap CSS added to deal with unusually long slugs on small screens -->
        <span v-html="notif.notifContent" style="word-wrap: break-word" />
      </div>
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
