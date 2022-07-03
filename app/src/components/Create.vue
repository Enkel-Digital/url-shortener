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
            :class="{ 'is-danger': slugTaken }"
            required
          />
        </label>
        <br />

        <p v-if="slugTaken">Slug is already taken, choose something else!</p>

        <span v-else-if="slug">
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
            :disabled="slugTaken"
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
        <label class="checkbox" for="querypassQueryCheckbox">
          <input
            v-model="passQuery"
            type="checkbox"
            id="querypassQueryCheckbox"
          />
          Allow URL queries to pass through?
        </label>

        <div v-if="passQuery" class="content box">
          <ul>
            <li>Note that this may have unintended side effects</li>
          </ul>
        </div>
      </div>

      <div class="column is-full">
        <button
          class="button is-light is-success is-fullwidth"
          @click="create"
          :disabled="slugTaken"
        >
          create
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "pinia";
import { useNotif } from "../store/notif";
import { useStore } from "../store/index";

import isInvalidURL from "../utils/isInvalidURL.js";

// Generate current date time used as the default date time value
// Formatted for input tag of 'datetime-local' type
const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
const currentDatetime = now.toISOString().slice(0, 16);

// Split this out so Object.values is not called on every change to convert the mappings object
const mappings = Object.values(useStore().mappings);
const slugTaken = (slug) => mappings.some((mapping) => mapping.slug === slug);

export default {
  name: "Create",

  data() {
    return {
      slug: "",
      url: undefined,
      permanent: useStore().settings.defaultToPermanentRedirects,
      baseURL: useStore().settings.baseURL,

      currentDatetime,

      expiryTime: currentDatetime,
      expiry: undefined,

      passQuery: useStore().settings.defaultToQueryPassThrough,
    };
  },

  computed: {
    slugTaken() {
      return slugTaken(this.slug);
    },
  },

  methods: {
    ...mapActions(useNotif, ["showNotif"]),
    ...mapActions(useStore, ["createMapping"]),

    async create() {
      if (!this.slug)
        return this.showNotif("Missing slug", { color: "danger" });

      if (!this.url) return this.showNotif("Missing URL", { color: "danger" });

      if (isInvalidURL(this.url))
        return this.showNotif(
          "URL must be a full URL with http/https protocol",
          { color: "danger" }
        );

      // @todo Add regex check prevent things like "/something" so that there is no extra / at the begin

      // @todo Check to ensure that the slug for that particular domain is not already taken
      // @todo This check could possibly be done on frontend if we have all the mappings, but backend still needs to double check

      // @todo Add expiry time
      const mapping = {
        slug: this.slug,
        url: this.url,
        permanent: this.permanent,
      };
      // Only add this property if it is true
      if (this.passQuery) mapping.passQuery = this.passQuery;

      const success = await this.createMapping(mapping);

      // Make sure that this method call ends right here by putting it in a return expression
      if (!success) return confirm("Try again?") && this.create();

      this.showNotif("Mapping created!");

      // If user set so, redirect back to view page once mapping is created
      if (useStore().settings.redirectBackToHome)
        this.$router.push({ name: "view" });
      // Else reset the data in this component
      // Reset the data values to its original state by re-running the data method
      // https://github.com/vuejs/vue/issues/702#issuecomment-308991548
      // https://www.carlcassar.com/articles/reset-data-in-a-vue-component
      else Object.assign(this.$data, this.$options.data());
    },
  },
};
</script>
