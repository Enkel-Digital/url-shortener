<template>
  <div>
    <div class="columns is-multiline is-vcentered">
      <div class="column">
        <p class="title">Mappings</p>
      </div>

      <div class="column is-narrow">
        <button class="button is-light is-danger" @click="logout">
          logout
        </button>
      </div>

      <div class="column is-narrow">
        <button class="button is-light is-warning" @click="loadMappings">
          Refresh
        </button>
      </div>

      <div class="column is-narrow">
        <router-link
          class="button is-light is-success"
          :to="{ name: 'create' }"
        >
          Create
        </router-link>
      </div>

      <div class="column is-full">
        <p class="subtitle">*All URLs are CASE SENSITIVE.</p>

        <p>Sort By: <b>Newest first</b></p>

        <div class="box" v-for="(mapping, i) in mappings" :key="i">
          <div class="columns is-multiline is-vcentered">
            <!-- @todo Might show less details here and route to another page on click to view more details -->
            <div class="column is-full">
              Slug: <b>{{ mapping.slug }}</b>
              <br />

              <!-- Wrap the URL if needed as it is usually very long -->
              URL: <b style="word-wrap: break-word">{{ mapping.url }}</b>
              <br />

              Type:
              <span class="has-text-danger" v-if="mapping.status === 301">
                Permanent
              </span>
              <span class="has-text-success" v-else-if="mapping.status === 302">
                Temporary
              </span>
              <br />

              Used: <b>{{ mapping.used }}</b> time(s)
              <br />

              By: {{ mapping.createdBy }}
              <br />

              {{ formatTimeslot(mapping.createdAt * 1000) }}
              <br />
            </div>

            <div class="column is-narrow">
              <button
                class="button is-light is-danger is-fullwidth"
                @click="deleteMapping(mapping.id, i)"
              >
                delete
              </button>
            </div>
            <div class="column i">
              <button
                class="button is-light is-warning is-fullwidth"
                @click="shareLink(mapping.slug)"
              >
                share
              </button>
            </div>
            <div class="column">
              <button
                class="button is-light is-success is-fullwidth"
                @click="copyLink(mapping.slug)"
              >
                copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "pinia";
import { useStore } from "../store/index";

import { oof } from "simpler-fetch";
import { auth, getAuthHeader } from "../firebase.js";

export default {
  name: "View",

  // Activated hook so that mappings will be reloaded everytime this component is activated under the keep-alive wrapping
  // So that users do not need to manually hit refresh when they go from create mapping view to view mapping
  activated() {
    this.loadMappings();
  },

  data() {
    return {
      mappings: [],
      baseURL: import.meta.env.VITE_baseURL,
    };
  },

  methods: {
    ...mapActions(useStore, ["showNotif"]),

    /*
      For whatever reason, browsers have yet to support the shorter form of passing options to locale formatter directly
      console.log(new Date().toLocaleDateString("default", { dateStyle: "full", timeStyle: "short" }));

      Only longer form works by passing to DateTimeFormat method.
      console.log(new Intl.DateTimeFormat('default', { dateStyle: 'full', timeStyle: 'short' }).format(new Date()));
    */
    formatTimeslot: (timeslot) =>
      new Intl.DateTimeFormat("default", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(timeslot)),

    async loadMappings() {
      const res = await oof
        .GET("/admin/mappings/all")
        .header(await getAuthHeader())
        .runJSON();

      // If the API call failed, recursively call itself again if user wants to retry,
      // And always make sure that this method call ends right here by putting it in a return expression
      if (!res.ok)
        return confirm(`Failed to get mappings\nTry again?`) && this.login();

      this.mappings = res.mappings;
    },

    shareLink(slug) {
      // Ensure navigator.share is available first, quit if not available
      if (!navigator.share) return alert("Web Share not supported on device");

      // Start the share UI, but not awaiting for it, as platforms resolve this at different timings
      navigator.share({
        // Default webshare options
        title: "Share link",
        text: "Share this shortened link",
        url: `${this.baseURL}${slug}`,
      });
    },

    async copyLink(slug) {
      navigator.clipboard
        .writeText(`${this.baseURL}${slug}`)
        .then(() => this.showNotif("URL Copied!"));
    },

    async deleteMapping(slug, mappingIndex) {
      const res = await oof
        .POST(`/admin/mappings/delete/${slug}`)
        .header(await getAuthHeader())
        .runJSON();

      // If the API call failed, recursively call itself again if user wants to retry,
      // And always make sure that this method call ends right here by putting it in a return expression
      if (!res.ok)
        return confirm(`Failed to delete mapping\nTry again?`) && this.login();

      this.mappings.splice(mappingIndex, 1);
    },

    async logout() {
      if (!confirm("Logout?")) return;

      // Signout current user
      await auth.signOut();

      // Redirect to login view
      this.$router.push({ name: "login" });
    },
  },
};
</script>
