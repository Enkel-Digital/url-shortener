<template>
  <div class="box mb-5 py-3 px-3 columns is-multiline is-vcentered">
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
        @click="deleteMapping(mapping.id)"
      >
        delete
      </button>
    </div>
    <div class="column">
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
</template>

<script setup>
import { useNotif } from "../store/notif";
import { useStore } from "../store/index";

defineProps({ mapping: { required: true } });

const store = useStore();
const baseURL = store.settings.baseURL;
const deleteMapping = store.deleteMapping;

// For whatever reason, browsers have yet to support the shorter form of passing options to locale formatter directly
// console.log(new Date().toLocaleDateString("default", { dateStyle: "full", timeStyle: "short" }));
//
// Only longer form works by passing to DateTimeFormat method.
// console.log(new Intl.DateTimeFormat('default', { dateStyle: 'full', timeStyle: 'short' }).format(new Date()));
const formatTimeslot = (timeslot) =>
  new Intl.DateTimeFormat("default", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(timeslot));

function shareLink(slug) {
  // Ensure navigator.share is available first, quit if not available
  if (!navigator.share) return alert("Web Share not supported on device");

  // Start the share UI, but not awaiting for it, as platforms resolve this at different timings
  navigator.share({
    // Default webshare options
    title: "Share link",
    text: "Share this shortened link",
    url: `${baseURL}${slug}`,
  });
}

const copyLink = (slug) =>
  navigator.clipboard
    .writeText(`${baseURL}${slug}`)
    .then(() => useNotif().showNotif(`Copied: ${baseURL}<b>${slug}</b>`));
</script>
