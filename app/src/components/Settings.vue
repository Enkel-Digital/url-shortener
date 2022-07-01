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
                  v-model="rootRedirectURL"
                  placeholder="https://example.com"
                  class="input"
                  pattern="https://.*|http://.*"
                  @keypress.enter="
                    rootRedirectURL !== mainStore.settings.rootMapping?.url &&
                      updateRootRedirectURL()
                  "
                  required
                />
              </div>
              <div class="control">
                <button
                  class="button is-success"
                  :disabled="
                    rootRedirectURL === mainStore.settings.rootMapping?.url
                  "
                  @click="updateRootRedirectURL"
                >
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

      <div class="column is-full">
        <div class="box">
          <p class="subtitle mb-1">Not Found (404) redirect</p>
          All invalid URLs will be redirected here. If this is blank, users will
          see a generic invalid URL error page.
          <br />
          <br />

          <label>
            <b>To</b> (enter full URL with http/https)

            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  type="url"
                  v-model="notFoundRedirectURL"
                  placeholder="https://example.com"
                  class="input"
                  pattern="https://.*|http://.*"
                  @keypress.enter="
                    notFoundRedirectURL !==
                      mainStore.settings.notFoundMapping?.url &&
                      updateNotFoundRedirectURL()
                  "
                  required
                />
              </div>
              <div class="control">
                <button
                  class="button is-success"
                  :disabled="
                    notFoundRedirectURL ===
                    mainStore.settings.notFoundMapping?.url
                  "
                  @click="updateNotFoundRedirectURL"
                >
                  Update
                </button>
              </div>
            </div>
          </label>
          <br />

          <label>
            <b>Default 404 redirect URL</b>

            <div class="columns">
              <div class="column">
                <a
                  :href="
                    defaultNotFoundRedirectURL +
                    `/?notFound=${mainStore.settings.baseURL}sample-invalid-link`
                  "
                  target="_blank"
                  class="button is-light is-success is-fullwidth"
                >
                  Preview: {{ defaultNotFoundRedirectURL }}
                </a>
              </div>
              <div class="column is-narrow">
                <button
                  class="button is-light is-warning is-fullwidth"
                  @click="notFoundRedirectURL = defaultNotFoundRedirectURL"
                >
                  Reset to default link
                </button>
              </div>
            </div>
          </label>

          <div class="box is-clickable mt-4">
            <details>
              <summary>Note: 404 Redirects cannot be permanent</summary>
              Because if you were to create a mapping after the user has been
              permanently redirected once, then they would not be able to use
              that shortened link again without clearing cache.
            </details>
          </div>
        </div>
      </div>

      <!-- @todo Change checkboxes to use a slider or something nicer? -->
      <div class="column is-full">
        <div class="box">
          <p class="subtitle">Others</p>

          <div class="mx-3">
            <label class="checkbox">
              <input
                v-model="mainStore.settings.defaultToPermanentRedirects"
                type="checkbox"
              />
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

// The settings state is writable through the UI directly,
// any changes to the settings state will trigger a notification.
watch(mainStore.settings, () => showNotif("Settings updated!"));

let rootRedirectURL = ref(mainStore.settings.rootMapping?.url);
let notFoundRedirectURL = ref(mainStore.settings.notFoundMapping?.url);
let permanent = ref(false);
const defaultNotFoundRedirectURL = "https://404.short.enkeldigital.com";

async function updateRootRedirectURL() {
  if (isInvalidURL(rootRedirectURL.value))
    return showNotif("URL must be a full URL with http/https protocol", {
      color: "danger",
    });

  // Call the API to set the root redirect
  mainStore.setRootMapping({
    url: rootRedirectURL.value,
    permanent: permanent.value,
  });
}

async function updateNotFoundRedirectURL() {
  if (isInvalidURL(notFoundRedirectURL.value))
    return showNotif("URL must be a full URL with http/https protocol", {
      color: "danger",
    });

  // Call the API to set the not found redirect
  mainStore.setNotFoundMapping({ url: notFoundRedirectURL.value });
}
</script>
