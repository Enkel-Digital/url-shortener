import { defineStore } from "pinia";

import { oof } from "simpler-fetch";
import { getAuthHeader } from "../firebase.js";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useStore = defineStore("main", {
  // arrow function recommended for full type inference
  state: () => ({
    settings: {
      rootRedirectURL: undefined,
      notFoundRedirectURL: undefined,
      defaultToPermanentRedirects: false,
      redirectBackToHome: true,
      baseURL: import.meta.env.VITE_baseURL,
    },

    // Property storing all the raw mappings data as an object, and is only used with a getter to convert and sort as array
    _mappings: {},
  }),

  getters: {
    mappings: (state) =>
      Object.values(state._mappings).sort((a, b) => b.createdAt - a.createdAt),
  },

  actions: {
    async loadMappings() {
      const res = await oof
        .GET("/admin/mappings/all")
        .header(getAuthHeader)
        .runJSON();

      // If the API call failed, recursively call itself again if user wants to retry,
      // And always make sure that this method call ends right here by putting it in a return expression
      if (!res.ok)
        return (
          confirm(`Failed to get mappings\nTry again?`) && this.loadMappings()
        );

      this._mappings = res.mappings;
    },

    async deleteMapping(mappingID) {
      if (!confirm("Delete mapping?")) return;

      const res = await oof
        .POST(`/admin/mappings/delete/${mappingID}`)
        .header(getAuthHeader)
        .runJSON();

      // If the API call failed, recursively call itself again if user wants to retry,
      // And always make sure that this method call ends right here by putting it in a return expression
      if (!res.ok)
        return confirm(`Deletion failed\nTry again?`) && this.deleteMapping();

      delete this._mappings[mappingID];
    },

    async createMapping(mapping) {
      const res = await oof
        .POST("/admin/mappings/new")
        .header(getAuthHeader)
        .data(mapping)
        .runJSON();

      if (!res.ok) return alert(res.error);

      // @todo Need to get back the mappingID from the backend to add into mapping before saving locally
      // this.mappings.push(mapping);

      // Return true so that the UI can be updated accordingly
      return true;
    },

    async setRootMapping(mapping) {
      const res = await oof
        .POST("/admin/mappings/root")
        .header(getAuthHeader)
        .data(mapping)
        .runJSON();

      if (!res.ok) return alert(res.error);

      this.settings.rootRedirectURL = mapping.url;
    },

    async setNotFoundMapping(mapping) {
      const res = await oof
        .POST("/admin/mappings/404")
        .header(getAuthHeader)
        .data(mapping)
        .runJSON();

      if (!res.ok) return alert(res.error);

      this.settings.notFoundRedirectURL = mapping.url;
    },
  },

  // https://www.npmjs.com/package/pinia-plugin-persistedstate
  // Persists this store's state in localStorage to reuse across sessions
  // Note that this is not efficient for large to extremely large state trees,
  // as on every state change, the entire tree is serialized and saved.
  persist: true,
});
