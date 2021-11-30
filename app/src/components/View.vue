<template>
  <div class="px-5 py-5">
    <div class="columns is-multiline is-vcentered">
      <div class="column">
        <p class="subtitle">Mappings</p>
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
        <div class="box">
          <div class="box" v-for="(mapping, i) in mappings" :key="i">
            <div class="columns is-vcentered">
              <div class="column">
                Slug: <b>{{ mapping.slug }}</b>
                <br />

                URL: <b>{{ mapping.url }}</b>
                <br />

                {{ formatTimeslot(mapping.createdAt * 1000) }}
                <br />
              </div>

              <div class="column is-narrow">
                <button
                  class="button is-light is-danger"
                  @click="deleteMapping(mapping.slug, i)"
                >
                  delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { oof } from "simpler-fetch";
import { auth, getAuthHeader } from "../firebase.js";

export default {
  name: "View",

  created() {
    this.loadMappings();
  },

  data() {
    return { mappings: [] };
  },

  methods: {
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
