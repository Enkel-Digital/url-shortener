<template>
  <div>
    <div class="columns is-multiline">
      <div class="column">
        <label><b>URL Shortener Admin Portal</b></label>

        <input
          type="text"
          v-model="email"
          placeholder="Email"
          @keypress.enter="login"
          class="input mb-4"
          style="width: 100%"
          required
        />

        <br />

        <input
          type="password"
          v-model="password"
          placeholder="Password"
          @keypress.enter="login"
          class="input mb-4"
          style="width: 100%"
          required
        />

        <br />

        <button class="button is-light is-fullwidth is-success" @click="login">
          Login
        </button>
      </div>
    </div>

    <!-- <version /> -->
  </div>
</template>

<script>
import { auth } from "../firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";

import { useStore } from "../store/index";

export default {
  name: "Login",

  data() {
    return {
      email: "",
      password: "",
    };
  },

  methods: {
    async login() {
      try {
        // Only need the user object from the userCredential object
        const { user } = await signInWithEmailAndPassword(
          auth,

          // Remove empty spaces to prevent whitespaces from causing signin issues
          this.email.trim(),
          this.password
        );

        // Get the JWT from user object
        const token = await user.getIdTokenResult();

        // Check explicitly that the admin claims is set to Boolean true,
        // as JSON value can be any other truthy primitive too.
        if (token.claims.admin !== true) {
          // Throw new error with pre-defined code to get the right error_msg
          const error = new Error();
          error.code = "user/not-admin";
          throw error;
        }

        // Set the baseURL using the host value on the user's JWT joined with a trailing slash
        // The trailing slash is needed as all host values do not have trailing slash,
        // and baseURL will be used to create the host+slug combo for copying to user clipboard.
        useStore().$state.settings.baseURL = token.claims.host + "/";

        // Route to main page, after login
        this.$router.replace({ name: "view" });
      } catch (error) {
        // If there is an error but user is somehow logged in, sign user out to try again
        if (auth.currentUser) await auth.signOut();

        alert(
          (function (err) {
            switch (err.code) {
              case "auth/wrong-password":
                return "Invalid password or email!";
              case "auth/network-request-failed":
                return "Oops, check your internet connection!";
              case "auth/user-not-found":
                return "Sorry but you dont have an account with us 😭\nSignup with your admin";
              case "email/no-verify":
                return "Email not verified.\nPlease verify before trying again";
              case "user/not-admin":
                return "You do not have access to the admin portal\nRequest access from admin";
              default:
                return "Something went wrong! Please try again.";
            }
          })(error)
        );
      }
    },
  },
};
</script>
