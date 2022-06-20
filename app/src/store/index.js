import { defineStore } from "pinia";

import { oof } from "simpler-fetch";
import { getAuthHeader } from "../firebase.js";

import isInvalidURL from "../utils/isInvalidURL.js";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useStore = defineStore("main", {
  // arrow function recommended for full type inference
  state: () => ({
    // @todo Convert this into an object instead and add a getter to convert and sort as array
    // Starts as undefined so that the UI can treat it as not loaded yet and show a different UI.
    mappings: undefined,
  }),

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

      this.mappings = res.mappings;
    },

    async deleteMapping(mappingID, mappingIndex) {
      if (!confirm("Delete mapping?")) return;

      const res = await oof
        .POST(`/admin/mappings/delete/${mappingID}`)
        .header(getAuthHeader)
        .runJSON();

      // If the API call failed, recursively call itself again if user wants to retry,
      // And always make sure that this method call ends right here by putting it in a return expression
      if (!res.ok)
        return confirm(`Deletion failed\nTry again?`) && this.deleteMapping();

      this.mappings.splice(mappingIndex, 1);
    },

    async createMapping(mapping) {
      // @todo Change all of this to use global notif banner
      // if (!this.slug) return alert("Missing slug");
      if (!this.url) return alert("Missing URL");
      if (isInvalidURL(this.url))
        return alert("URL must be a full URL with http/https protocol");

      // @todo Add regex check prevent things like "/something" so that there is no extra / at the begin
      // @todo Check to ensure that the slug for that particular domain is not already taken

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
  },
});
