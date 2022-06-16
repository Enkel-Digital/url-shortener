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
          Base URL: <b>{{ baseURL }}</b>
        </div>
      </div>

      <div class="column is-full">
        <div class="box">
          <p class="subtitle">Root redirect</p>
          <label>
            <b>From</b>

            <input type="text" v-model="baseURL" class="input" disabled />
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

          <!-- @todo Change to use a slider or something -->
          <label class="checkbox">
            <span class="mr-3">By default?</span>
            <input v-model="permanent" type="checkbox" />
          </label>
        </div>
      </div>

      <div class="column is-full">
        <button
          class="button is-light is-fullwidth"
          :class="{ 'is-success': true }"
          :disabled="true"
          @click="update"
        >
          Update Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "pinia";
import { useNotif } from "../store/notif";
import { useStore } from "../store/index";

export default {
  name: "Settings",

  data() {
    return {
      url: undefined,
      permanent: false,

      baseURL: import.meta.env.VITE_baseURL,
    };
  },

  methods: {
    ...mapActions(useNotif, ["showNotif"]),

    async update() {
      this.showNotif("Settings updated!");
    },
  },
};
</script>
