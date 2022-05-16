<script setup>
// import Loader from "./components/Loader.vue";
</script>

<template>
  <div class="container px-5 py-5" style="max-width: 50em">
    <!-- Conditionally show the loader based on the shared global loading flag -->
    <!-- <Loader v-if="$store.state.loading" /> -->

    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
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
