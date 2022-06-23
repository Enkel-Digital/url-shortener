<template>
  <div>
    <div class="columns is-multiline is-vcentered">
      <div class="column">
        <p class="title">Settings</p>
      </div>

      <div class="column is-narrow">
        <router-link class="button is-light is-success" :to="{ name: 'view' }">
          Back
        </router-link>
      </div>

      <div class="column is-full">
        <div class="box">
          Base URL: <b>{{ mainStore.settings.baseURL }}</b>
        </div>
      </div>

      <div class="column is-full">
        <div class="box">
          <p class="subtitle">Root redirect</p>
          <label>
            <b>From</b>

            <input
              type="text"
              v-model="mainStore.settings.baseURL"
              class="input"
              disabled
            />
          </label>

          <br />
          <br />

          <label>
            <b>To</b> (enter full URL with http/https)

            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  type="url"
                  v-model="url"
                  placeholder="https://example.com"
                  class="input"
                  pattern="https://.*|http://.*"
                  @keypress.enter="update"
                  required
                />
              </div>
              <div class="control">
                <button class="button is-success" @click="update">
                  Update
                </button>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div class="column is-full">
        <div class="box">
          <p class="subtitle">Select permanent redirect by default?</p>

          <label class="checkbox">
            <span class="mr-3">By default?</span>
            <input v-model="mainStore.settings.permanent" type="checkbox" />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

import { useNotif } from "../store/notif";
import { useStore } from "../store/index";

import isInvalidURL from "../utils/isInvalidURL.js";

const mainStore = useStore();
const showNotif = useNotif().showNotif;

let url = ref(useStore().settings.url);

// The settings state is writable through the UI directly,
// any changes to the settings state will trigger a notification.
watch(mainStore.settings, () => showNotif("Settings updated!"));

async function update() {
  if (isInvalidURL(url.value))
    return showNotif("URL must be a full URL with http/https protocol", {
      color: "danger",
    });

  // @todo Call the API to set the root redirect

  // Set the URL once the URL has been validated
  mainStore.settings.url = url;
}
</script>
