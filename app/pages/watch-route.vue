<script setup>
import { computed, ref, watch, onUnmounted } from "vue";
import useMediaChecks from "../../composables/useMediaChecks";
import QrExport from "../components/QrExport.vue";

const route = useRoute();
const node1 = route.query.node_1 ? Number(route.query.node_1) : null;
const node2 = route.query.node_2 ? Number(route.query.node_2) : null;

// if a path of nodes are provided use these
const pathQuery = route.query.path ? String(route.query.path) : null;
// split the path/connection chain into a array
const pathNodes = pathQuery
  ? pathQuery
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((n) => Number(n))
  : null;

const {
  data: connections,
  pending: connectionsPending,
  error: connectionsError,
} = await useFetch("/api/connection");
const {
  data: nodes,
  pending: nodesPending,
  error: nodesError,
} = await useFetch("/api/node");

// build a map of node_id to node_name for easy lookup
const nodesMap = computed(() => {
  const map = {};
  const list = (nodes && nodes.value) || [];
  for (const n of list)
    map[n.node_id] = n.node_name || n.name || String(n.node_id);
  return map;
});

const { isImageType, isVideoType } = useMediaChecks();

// current page URL for QR export (client-side only)
const pageUrl = computed(() => (typeof window === "undefined" ? "" : window.location.href));

const selectedConnection = computed(() => {
  const list = (connections && connections.value) || [];
  return (
    list.find(
      (c) => Number(c.node_1) === node1 && Number(c.node_2) === node2,
    ) || null
  );
});

// If a path of nodes is provided comma seperated nodes,
// build a chain of connections that link nodes in order
const connectionChain = computed(() => {
  const list = (connections && connections.value) || [];
  if (!pathNodes || pathNodes.length < 2) return [];
  // start building the chain for the path of nodes in order
  const chain = [];
  for (let i = 0; i < pathNodes.length - 1; i++) {
    const a = Number(pathNodes[i]);
    const b = Number(pathNodes[i + 1]);

    // try to find a connection that links these nodes in either direction
    let conn = list.find(
      (c) => Number(c.node_1) === a && Number(c.node_2) === b,
    );
    if (!conn)
      conn = list.find((c) => Number(c.node_1) === b && Number(c.node_2) === a);
    if (conn) chain.push(conn);
  }
  return chain;
});

// combine the media across the connection chain
const combinedMediaList = computed(() => {
  const chain = connectionChain.value || [];
  // final combined list of media and nodes
  const combined = [];
  for (let ci = 0; ci < chain.length; ci++) {
    const conn = chain[ci];
    const medias =
      conn && conn.media
        ? conn.media
            .slice()
            .sort((x, y) => (x.order_num || 0) - (y.order_num || 0))
        : [];
    for (const m of medias) {
      combined.push(
        Object.assign({}, m, {
          __connIndex: ci,
          __node_1: conn.node_1,
          __node_2: conn.node_2,
        }),
      );
    }
  }
  return combined;
});

const mediaList = computed(() => {
  // If connection chain exists, use combined list
  if (pathNodes && pathNodes.length > 1) return combinedMediaList.value;
  const sc = (selectedConnection && selectedConnection.value) || null;
  return sc && sc.media ? sc.media : [];
});

const currentIndex = ref(0);

watch(
  () => route.query.path,
  () => {
    currentIndex.value = 0;
  },
);

const currentMedia = computed(() => {
  return mediaList.value.length
    ? mediaList.value[
        Math.min(Math.max(0, currentIndex.value), mediaList.value.length - 1)
      ]
    : null;
});

const prevMedia = () => {
  if (currentIndex.value > 0) currentIndex.value--;
};

const nextMedia = () => {
  if (currentIndex.value < mediaList.value.length - 1) currentIndex.value++;
};

const instructionTextEl = ref(null);


const printPage = () => {
  if (typeof window === 'undefined') return;
  try {
    window.print();
  } catch (e) {
    console.error('Print failed', e);
  }
};


const getPreferredSpeechLang = () => {
  if (typeof document === "undefined") return "en-GB";

  const translateSelect = document.querySelector(".goog-te-combo");
  if (translateSelect && translateSelect.value) return String(translateSelect.value);

  if (document.documentElement && document.documentElement.lang) {
    return document.documentElement.lang;
  }

  return "en-GB";
};

const speakDescription = (text) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const domText = instructionTextEl.value
    ? instructionTextEl.value.innerText || instructionTextEl.value.textContent
    : "";

  const spokenText =
    (typeof text === "string" && text.trim()) ||
    (typeof domText === "string" ? domText.trim() : "");

  if (!spokenText) return;

  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.lang = getPreferredSpeechLang();
  window.speechSynthesis.speak(utterance);
};

onUnmounted(() => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
});
</script>

<template>
  <div class="route-page-container">
    <div>
      <h1>Selected route</h1>
      <div class="no-print" style="margin-top:8px; display:flex; gap:8px; align-items:center">
        <QrExport :text="pageUrl" />
        <button @click="printPage">Print / Save PDF</button>
      </div>

      <p v-if="connectionsPending || nodesPending">Loading route...</p>
      <p v-if="connectionsError || nodesError">Error loading route.</p>

      <div v-if="pathNodes && pathNodes.length > 1">
        <h2 id="node-path-preview">
          <br />
          {{ pathNodes.map((n) => nodesMap[n] || n).join(" → ") }}
        </h2>
        <hr />
        <div>
          <div v-if="mediaList && mediaList.length" class="">
            <div>
              <div v-if="currentMedia" class="route-media-box">
                <h2>Step {{ currentIndex + 1 }} of {{ mediaList.length }}</h2>
                <span v-if="isImageType(currentMedia)">
                  <img
                    :src="currentMedia.media_url"
                    alt="media"
                    class="route-media-image"
                  />
                </span>
                <span v-else-if="isVideoType(currentMedia)">
                  <video
                    :src="currentMedia.media_url"
                    controls
                  ></video>
                </span>
                <span v-else>
                  <a :href="currentMedia.media_url" target="_blank"
                    >Open media {{ currentMedia.media_id }}</a
                  >
                </span>
                <h4>Instructions:</h4>
                <div v-if="currentMedia.content_desc" class="instruction-block">
                  <em ref="instructionTextEl" class="instruction-text">{{ currentMedia.content_desc }}</em>
                  <button
                    class="tts-button"  
                    @click="speakDescription()"
                    title="Read description"
                  >
                    🔊 Read out the direction
                  </button>
                </div>
              </div>

              <div class="media-nav-controls">
                <button v-if="currentIndex > 0" @click="prevMedia" class="route-nav-button">
                  Previous
                </button>
                <button
                  class="route-nav-button no-print"
                  @click="nextMedia"
                  :disabled="currentIndex >= mediaList.length - 1"
                >
                  Next
                </button>
              </div>
              <span class="media-step-counter"
                >({{ currentIndex + 1 }} / {{ mediaList.length }})</span
              >
            </div>
          </div>
          <div v-else>
            <p>No media assigned across this route chain.</p>
          </div>
        </div>
        <!-- Print-only full steps: when printing, show every step on its own page -->
        <div class="print-only" v-if="mediaList && mediaList.length">
          <h2>Full route steps</h2>
          <div v-for="(m, idx) in mediaList" :key="m.media_id || idx" class="print-step">
            <h3>Step {{ idx + 1 }} of {{ mediaList.length }} — {{ (nodesMap[m.__node_1] || nodesMap[m.node_1] || m.__node_1 || m.node_1) }} → {{ (nodesMap[m.__node_2] || nodesMap[m.node_2] || m.__node_2 || m.node_2) }}</h3>
            <div v-if="isImageType(m)">
              <img :src="m.media_url" alt="media" class="route-media-image" />
            </div>
            <div v-else-if="isVideoType(m)">
              <!-- For printing we show the video poster as a link -->
              <a :href="m.media_url" target="_blank">Open media (video)</a>
            </div>
            <div v-else>
              <a :href="m.media_url" target="_blank">Open media</a>
            </div>
            <div class="print-instruction">
              <p v-if="m.content_desc">{{ m.content_desc }}</p>
              <p v-else class="muted">No instructions provided.</p>
            </div>
            <hr />
          </div>
        </div>
      </div>

      <div v-else-if="selectedConnection">
        <h2>
          {{ nodesMap[selectedConnection.node_1] || selectedConnection.node_1 }}
          ->
          {{ nodesMap[selectedConnection.node_2] || selectedConnection.node_2 }}
        </h2>
        <div class="location-text">
          <h3>Route details:</h3>
          <span v-if="selectedConnection.wheelchair_accessible">
            wheelchair accessible</span
          >
        </div>

        <div v-if="mediaList && mediaList.length" class="">
          <h3>Media</h3>
          <div>
            <div v-if="currentMedia" class="route-media-box">
              <h4>Step {{ currentIndex + 1 }} of {{ mediaList.length }}</h4>
              <span v-if="isImageType(currentMedia)">
                <img
                  :src="currentMedia.media_url"
                  alt="media"
                  class="route-media-image"
                />
              </span>
              <span v-else-if="isVideoType(currentMedia)">
                <video
                  :src="currentMedia.media_url"
                  controls
                ></video>
              </span>
              <span v-else>
                <a :href="currentMedia.media_url" target="_blank"
                  >Open media {{ currentMedia.media_id }}</a
                >
              </span>
              <small
                >(id: {{ currentMedia.media_id
                }}{{
                  currentMedia.order_num
                    ? ", order: " + currentMedia.order_num
                    : ""
                }})</small
              >
              <div v-if="currentMedia.content_desc" class="instruction-block">
                <p ref="instructionTextEl" class="instruction-text">{{ currentMedia.content_desc }}</p>
                <button
                  class="tts-button"
                  @click="speakDescription()"
                  title="Read description"
                >
                  🔊 Read out the direction
                </button>
              </div>
            </div>

            <div class="media-nav-controls">
              <button v-if="currentIndex > 0" @click="prevMedia" class="route-nav-button">
                Previous
              </button>
              <button
                class="route-nav-button"
                @click="nextMedia"
                :disabled="currentIndex >= mediaList.length - 1"
              >
                Next
              </button>
            </div>
            <span class="media-step-counter">{{ currentIndex + 1 }} / {{ mediaList.length }}</span>
          </div>
        </div>
        <div v-else>
          <p>No media assigned to this route.</p>
        </div>
      </div>

      <p v-else-if="!connectionsPending">Route not found.</p>
    </div>
  </div>
</template>


