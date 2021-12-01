<template>
  <div class="px-5 py-5">
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
        <input
          type="text"
          v-model="slug"
          placeholder="Slug"
          class="input mb-4"
          style="width: 100%"
          required
        />
      </div>

      <div class="column is-full">
        <input
          type="text"
          v-model="url"
          placeholder="URL"
          @keypress.enter="create"
          class="input mb-4"
          style="width: 100%"
          required
        />
      </div>

      <div class="column is-full">
        <input type="checkbox" id="permanentCheckbox" v-model="permanent" />
        <label for="permanentCheckbox">
          Permanent Redirect?
          <br />

          *NOTE Hard to change later as browser will not call API again.
        </label>
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
import { oof } from "simpler-fetch";
import { getAuthHeader } from "../firebase.js";

export default {
  name: "Create",

  data() {
    return {
      slug: undefined,
      url: undefined,
      permanent: false,
    };
  },

  methods: {
    async create() {
      const res = await oof
        .POST("/admin/mappings/new")
        .header(await getAuthHeader())
        .data({ slug: this.slug, url: this.url, permanent: this.permanent })
        .runJSON();

      // If the API call failed, recursively call itself again if user wants to retry,
      // And always make sure that this method call ends right here by putting it in a return expression
      if (!res.ok)
        return confirm(`${res.error}\n\nTry again?`) && this.create();

      alert("Mapping created!");

      // Reset the data values to its original state by re-running the data method
      // https://github.com/vuejs/vue/issues/702#issuecomment-308991548
      // https://www.carlcassar.com/articles/reset-data-in-a-vue-component
      Object.assign(this.$data, this.$options.data());
    },
  },
};
</script>
