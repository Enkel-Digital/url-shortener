import { defineStore } from "pinia";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useStore = defineStore("main", {
  // arrow function recommended for full type inference
  state: () => ({
    notif: false,
    notifContent: "",
  }),

  // https://pinia.vuejs.org/core-concepts/actions.html
  actions: {
    showNotif(notifContent, timeout = 3000) {
      this.notif = true;
      this.notifContent = notifContent;

      // Auto close notif banner after timeout
      setTimeout(() => (this.notif = false), timeout);
    },

    clearNotif() {
      this.notif = false;
    },
  },
});
