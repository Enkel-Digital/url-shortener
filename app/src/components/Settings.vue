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

          <div class="mt-4">
            <label class="checkbox" for="permanentCheckbox">
              <input
                v-model="permanent"
                type="checkbox"
                id="permanentCheckbox"
              />
              Permanent Redirect?
            </label>

            <!-- Show warning if user selects permanent redirect-->
            <div v-if="permanent" class="content box">
              <ul>
                <li>
                  Note that this will be hard to change later as browser will
                  not call API again.
                </li>
                <li>
                  It will still redirect even after you delete the mapping if
                  the browser caches this response long enough.
                </li>
                <li>
                  This will also be cheaper as the API is only called once
                  regardless of how many times users visit the link again,
                  therefore since it only runs on the first call, only the first
                  call is charged.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- @todo Change checkboxes to use a slider or something nicer? -->
      <div class="column is-full">
        <div class="box">
          <p class="subtitle">Others</p>

          <div class="mx-3">
            <label class="checkbox">
              <input v-model="mainStore.settings.permanent" type="checkbox" />
              Select permanent redirect by default?
            </label>
          </div>

          <div class="mx-3">
            <hr />
          </div>

          <div class="mx-3">
            <label class="checkbox">
              <input
                v-model="mainStore.settings.redirectBackToHome"
                type="checkbox"
              />
              Redirect back to Home view after creating new mapping?
            </label>
          </div>
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
let permanent = ref(false);

// The settings state is writable through the UI directly,
// any changes to the settings state will trigger a notification.
watch(mainStore.settings, () => showNotif("Settings updated!"));

async function update() {
  if (isInvalidURL(url.value))
    return showNotif("URL must be a full URL with http/https protocol", {
      color: "danger",
    });

  // Call the API to set the root redirect
  mainStore.createRootMapping({ url: url.value, permanent: permanent.value });
}
</script>
