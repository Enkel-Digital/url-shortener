<template>
  <div>
    <div class="columns is-multiline is-vcentered">
      <div class="column">
        <p class="title">Create</p>
      </div>

      <div class="column is-narrow">
        <router-link class="button is-light is-success" :to="{ name: 'view' }">
          Back
        </router-link>
      </div>

      <div class="column is-full">
        <p class="subtitle">*All URLs are CASE SENSITIVE</p>
      </div>

      <div class="column is-full">
        <label>
          Slug

          <input
            type="text"
            v-model="slug"
            placeholder="Slug"
            class="input mb-4"
            style="width: 100%"
            required
          />
        </label>
        <br />

        <span v-if="slug">
          Preview: {{ baseURL }}<b>{{ slug }}</b>
        </span>
      </div>

      <div class="column is-full">
        <label>
          Redirect to this URL

          <input
            type="text"
            v-model="url"
            placeholder="URL"
            @keypress.enter="create"
            class="input mb-4"
            style="width: 100%"
            required
          />
        </label>
      </div>

      <div class="column is-full">
        <label class="checkbox" for="permanentCheckbox">
          <input v-model="permanent" type="checkbox" id="permanentCheckbox" />
          Permanent Redirect?
        </label>

        <!-- Show warning if user selects permanent redirect-->
        <div v-if="permanent" class="content box">
          <ul>
            <li>
              Note that this will be hard to change later as browser will not
              call API again.
            </li>
            <li>
              It will still redirect even after you delete the mapping if the
              browser caches this response long enough.
            </li>
            <li>
              This will also be cheaper as the API is only called once and not
              many times even as users go there again. Only charged for number
              of times the API server runs, so since it is only run on first
              call, charges once only.
            </li>
          </ul>
        </div>
      </div>

      <!-- @todo Add a field on date of starting validity -->

      <!-- @todo if user checks permanent checkbox, then this should be cache control date -->
      <div class="column is-full">
        <label class="checkbox" for="expiryCheckbox">
          <input v-model="expiry" type="checkbox" id="expiryCheckbox" />
          Set auto expiry time (<b>never expires by default</b> until you delete
          the mapping)
          <br />
        </label>

        <div v-if="expiry">
          <input
            type="datetime-local"
            class="input"
            v-model="expiryTime"
            :min="currentDatetime"
          />
        </div>
      </div>

      <div class="column is-full">
        <button class="button is-light is-success is-fullwidth" @click="create">
          create
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "pinia";
import { useStore } from "../store/index";

import { oof } from "simpler-fetch";
import { getAuthHeader } from "../firebase.js";

// Generate current date time used as the default date time value
// Formatted for input tag of 'datetime-local' type
const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
const currentDatetime = now.toISOString().slice(0, 16);

/** Ensures it is both a valid URL and a valid HTTP protocol based URL */
function isInvalidURL(string) {
  try {
    const url = new URL(string);
    return !(url.protocol === "http:" || url.protocol === "https:");
  } catch {
    return true;
  }
}

export default {
  name: "Create",

  data() {
    return {
      slug: undefined,
      url: undefined,
      permanent: false,
      baseURL: import.meta.env.VITE_baseURL,

      currentDatetime,

      expiryTime: currentDatetime,
      expiry: undefined,
    };
  },

  methods: {
    ...mapActions(useStore, ["showNotif"]),

    /**
     * Checks and validates the form's inputs, if there is any issue, user will be alerted here
     * @returns {Boolean} returns true after validating all inputs
     */
    inputValidated() {
      if (!this.slug) return alert("Missing slug");
      if (!this.url) return alert("Missing URL");
      if (isInvalidURL(this.url))
        return alert(
          "Invalid 'url' must be a proper full URL with http/https protocol"
        );

      return true;
    },

    async create() {
      // Ensure all inputs are valid before calling API
      if (!this.inputValidated()) return;

      const res = await oof
        .POST("/admin/mappings/new")
        .header(getAuthHeader)
        .data({ slug: this.slug, url: this.url, permanent: this.permanent })
        .runJSON();

      // If the API call failed, recursively call itself again if user wants to retry,
      // And always make sure that this method call ends right here by putting it in a return expression
      if (!res.ok)
        return confirm(`${res.error}\n\nTry again?`) && this.create();

      this.showNotif("Mapping created!");

      // Redirect back to view page once mapping is created
      this.$router.push({ name: "view" });

      // Reset the data values to its original state by re-running the data method
      // https://github.com/vuejs/vue/issues/702#issuecomment-308991548
      // https://www.carlcassar.com/articles/reset-data-in-a-vue-component
      // Object.assign(this.$data, this.$options.data());
    },
  },
};
</script>
