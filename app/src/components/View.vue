<template>
  <div>
    <div class="columns is-multiline is-vcentered">
      <div class="column">
        <p class="title">Mappings</p>
      </div>

      <div class="column is-narrow">
        <button class="button is-light is-danger is-fullwidth" @click="logout">
          logout
        </button>
      </div>

      <div class="column is-narrow">
        <button
          class="button is-light is-warning is-fullwidth"
          @click="loadMappings"
        >
          Refresh
        </button>
      </div>

      <div class="column is-narrow">
        <router-link
          class="button is-light is-success is-fullwidth"
          :to="{ name: 'create' }"
        >
          Create
        </router-link>
      </div>

      <div class="column is-narrow">
        <router-link class="button is-fullwidth" :to="{ name: 'settings' }">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 80 80"
            width="18px"
            height="18px"
          >
            <path
              fill="#dcd5f2"
              d="M34.961,77.5l-2.274-9.096l-0.284-0.076c-4.999-1.338-9.552-3.958-13.168-7.577l-0.208-0.208 l-8.984,2.57l-5.038-8.727l6.74-6.517l-0.076-0.284c-0.681-2.549-1.026-5.101-1.026-7.586s0.345-5.037,1.026-7.586l0.076-0.284 l-6.74-6.517l5.038-8.727l8.984,2.57l0.208-0.208c3.616-3.619,8.169-6.239,13.168-7.577l0.284-0.076L34.961,2.5h10.076 l2.274,9.096l0.284,0.076c4.999,1.338,9.553,3.958,13.169,7.577l0.208,0.208l8.983-2.57l5.038,8.727l-6.74,6.517l0.076,0.284 c0.681,2.548,1.026,5.1,1.026,7.586c0,2.485-0.345,5.038-1.026,7.586l-0.076,0.284l6.74,6.516l-5.038,8.727l-8.984-2.57 l-0.208,0.208c-3.617,3.619-8.17,6.239-13.169,7.577l-0.284,0.076L45.038,77.5H34.961z M40,24.571 c-8.507,0-15.429,6.921-15.429,15.429S31.493,55.429,40,55.429S55.428,48.507,55.428,40S48.507,24.571,40,24.571z"
            />
            <path
              fill="#8b75a1"
              d="M44.648,3l2.108,8.431l0.143,0.571l0.569,0.152c4.914,1.315,9.39,3.89,12.944,7.447l0.416,0.417 l0.566-0.162l8.325-2.382l4.648,8.051l-6.248,6.041l-0.423,0.409l0.152,0.568c0.67,2.506,1.009,5.015,1.009,7.457 c0,2.442-0.34,4.951-1.009,7.456l-0.152,0.568l0.423,0.409l6.248,6.041l-4.648,8.051l-8.325-2.381l-0.566-0.162l-0.416,0.417 c-3.554,3.557-8.03,6.132-12.944,7.447l-0.569,0.152l-0.143,0.571L44.648,77h-9.296l-2.108-8.431l-0.143-0.571l-0.569-0.152 c-4.914-1.315-9.39-3.89-12.944-7.447l-0.416-0.417l-0.566,0.162l-8.325,2.381l-4.648-8.05l6.248-6.041l0.423-0.409l-0.152-0.568 c-0.67-2.506-1.009-5.015-1.009-7.457s0.34-4.95,1.009-7.457l0.152-0.568l-0.423-0.409l-6.248-6.041l4.648-8.05l8.325,2.381 l0.566,0.162l0.416-0.417c3.554-3.557,8.03-6.132,12.944-7.447l0.569-0.152l0.143-0.571L35.352,3H44.648 M40,55.929 c8.783,0,15.929-7.146,15.929-15.929S48.783,24.071,40,24.071c-8.783,0-15.929,7.146-15.929,15.929S31.217,55.929,40,55.929 M45.428,2H34.571l-2.297,9.189c-5.138,1.375-9.743,4.054-13.393,7.706l-9.076-2.596l-5.429,9.403l6.809,6.584 c-0.659,2.465-1.043,5.042-1.043,7.715s0.385,5.25,1.043,7.715l-6.809,6.584l5.429,9.403l9.076-2.596 c3.65,3.652,8.255,6.331,13.393,7.706L34.571,78h10.857l2.297-9.189c5.138-1.375,9.743-4.054,13.393-7.706l9.076,2.596 l5.429-9.403l-6.809-6.584c0.659-2.465,1.043-5.042,1.043-7.715s-0.384-5.25-1.043-7.715l6.809-6.584l-5.429-9.403l-9.076,2.596 c-3.65-3.652-8.255-6.331-13.393-7.706L45.428,2L45.428,2z M40,54.929c-8.245,0-14.929-6.684-14.929-14.929 c0-8.245,6.684-14.929,14.929-14.929S54.928,31.755,54.928,40C54.928,48.245,48.245,54.929,40,54.929L40,54.929z"
            />
            <g>
              <path
                fill="#eeebf7"
                d="M40,61.5c-11.855,0-21.5-9.645-21.5-21.5S28.145,18.5,40,18.5S61.5,28.145,61.5,40 S51.855,61.5,40,61.5z M40,31.5c-4.687,0-8.5,3.813-8.5,8.5s3.813,8.5,8.5,8.5s8.5-3.813,8.5-8.5S44.687,31.5,40,31.5z"
              />
              <path
                fill="#8b75a1"
                d="M40,19c11.579,0,21,9.421,21,21s-9.421,21-21,21c-11.579,0-21-9.421-21-21S28.42,19,40,19 M40,49 c4.963,0,9-4.037,9-9s-4.037-9-9-9c-4.963,0-9,4.037-9,9S35.037,49,40,49 M40,18c-12.15,0-22,9.85-22,22c0,12.15,9.85,22,22,22 s22-9.85,22-22C62,27.85,52.15,18,40,18L40,18z M40,48c-4.418,0-8-3.582-8-8c0-4.418,3.582-8,8-8s8,3.582,8,8 C48,44.418,44.418,48,40,48L40,48z"
              />
            </g>
          </svg>
        </router-link>
      </div>

      <!-- Original value is undefined so we know that it is still loading -->
      <div v-if="mappings === undefined" class="column is-full">
        <div class="box">
          <p class="subtitle">Loading...</p>
        </div>
      </div>

      <div v-else-if="mappings.length === 0" class="column is-full">
        <div class="box">
          <p class="subtitle">
            There are no mappings found, click to create your first mapping now!
          </p>

          <router-link
            class="button is-large is-light is-success is-fullwidth"
            :to="{ name: 'create' }"
          >
            Create
          </router-link>
        </div>
      </div>

      <div v-else class="column is-full">
        <div class="box">
          <label>
            <b>Search (by slug)</b>

            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  ref="searchField"
                  type="text"
                  v-model="search_input"
                  placeholder="E.g. SlugName"
                  required
                  class="input"
                  style="width: 100%"
                />
              </div>
              <div class="control">
                <button class="button" @click="clearSearchInput">clear</button>
              </div>
            </div>
          </label>
        </div>

        <p class="subtitle">*All URLs are CASE SENSITIVE.</p>

        <p>Sort By: <b>Newest first</b></p>

        <!--
          *Through the use of Mapping component, the code is much more readable and can be easily reused,
          However, it is alot less efficient compared to writing the code here in the parent component,
          as for every new Mapping component alot more work needs to do be done now that it is its own
          component rather than just sharing code/functions inline in the parent component.
        -->

        <!-- Show all mapping if the user leaves the search box empty -->
        <div v-if="search_input === ''">
          <Mapping
            v-for="(mapping, i) in mappings"
            :key="i"
            :mapping="mapping"
          />
        </div>

        <div v-else>
          <!--
            Planned to show UI if it is an exact match, however there is a bug with the scoring.
            https://github.com/krisk/Fuse/issues/481
          -->
          <Mapping
            v-for="({ item: mapping }, i) in results"
            :key="i"
            :mapping="mapping"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useNotif } from "../store/notif";
import { useStore } from "../store/index";

import { auth } from "../firebase.js";

import Fuse from "fuse.js";

import Mapping from "./Mapping.vue";

export default {
  name: "View",

  components: { Mapping },

  // Mappings will be loaded everytime so that users don't need to hit refresh manually
  created() {
    this.loadMappings();
  },

  data() {
    return {
      baseURL: useStore().settings.baseURL,

      // Data for search
      search_input: "",
      search_options: {
        keys: ["slug"],

        // When to give up search. A threshold of 0.0 requires a perfect match (of both letters and location), a threshold of 1.0 would match anything
        threshold: 0.5,
      },
    };
  },

  computed: {
    ...mapState(useStore, ["mappings"]),

    // Update fuse object when search options is updated
    fuse() {
      return new Fuse(this.mappings, this.search_options);
    },

    // Continously search as user input changes
    results() {
      return this.fuse.search(
        this.search_input,

        // @todo Let user set this limit
        // Limit max number of returned search results to ensure not too many results are returned (esp for lower spec mobile devices),
        // especially at the start of the search where alot of results will be matched when only 1 - 4 characters are entered
        { limit: 12 }
      );
    },
  },

  methods: {
    ...mapActions(useNotif, ["showNotif"]),
    ...mapActions(useStore, ["loadMappings"]),

    // Clear the search input box and re-focus on the search field
    clearSearchInput() {
      this.search_input = "";
      this.$refs.searchField.focus();
    },

    async logout() {
      if (!confirm("Logout?")) return;

      // Signout current user
      await auth.signOut();

      // Clear storage medium used for data storage by the "pinia-plugin-persistedstate" plugin
      // So that data is not left for all to see after logging out,
      // and when switching accounts on the same browser, data will not be mixed.
      localStorage.clear();

      // Reset all state in the main pinia store so that when switching accounts on the same browser without reload, data will not be mixed.
      useStore().$reset();

      // Redirect to login view
      this.$router.push({ name: "login" });
    },
  },
};
</script>
