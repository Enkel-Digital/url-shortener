import { defineStore } from "pinia";

export const useNotif = defineStore("notif", {
  // arrow function recommended for full type inference
  state: () => ({
    notif: false,
    notifContent: "",
    autoCloseTimeout: undefined,
  }),

  actions: {
    clearTimeoutIfAny() {
      // If there is already an auto close timeout set, remove it,
      // So that the auto close will not close a newly requested banner
      if (this.autoCloseTimeout) {
        clearTimeout(this.autoCloseTimeout);
        this.autoCloseTimeout = undefined;
      }
    },

    showNotif(notifContent, timeout = 3000) {
      this.clearTimeoutIfAny();

      this.notif = true;
      this.notifContent = notifContent;

      // Auto close notif banner after timeout
      this.autoCloseTimeout = setTimeout(() => (this.notif = false), timeout);
    },

    clearNotif() {
      this.clearTimeoutIfAny();
      this.notif = false;
    },
  },
});
