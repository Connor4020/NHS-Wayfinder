<template>
  <main>
    <div style="padding: 20px">
      <h2>Graph</h2>
      <p>
        {{ formattedGraph }}
      </p>

      <div class="form-group">
        <label>Start Node:</label>
        <input v-model="startNode" />
      </div>

      <div class="form-group">
        <label>Target Node:</label>
        <input v-model="targetNode" />
      </div>

      <div class="checkbox-group">
        <input type="checkbox" v-model="inaccessible" />
        <label>Wheelchair User</label>
      </div>

      <button @click="runBFS">Find Shortest Path</button>

      <div v-if="shortestPath" class="result-box">
        <strong>Shortest Path:</strong>
        <span
          role="button"
          @click="watchPath"
          style="
            cursor: pointer;
            color: var(--nuxt-link-color, blue);
            text-decoration: underline;
          "
        >
          {{ shortestPath.join(" -> ") }}
        </span>
      </div>

      <div v-else-if="searched" class="error-text">No valid path found.</div>
    </div>

    <div class="debug-selection">
      <hr />
      <p>
        Here is where you will be able to create some nodes for debugging
        purposes.
      </p>
    </div>
  </main>
</template>

<script>
import { bfsShortestPath } from "@/../util/bfs";
import { createGraph } from "@/../util/graph";
import "../public/css/bfs-debug.css";

export default {
  data() {
    return {
      graph: {},
      nodes: [],
      connections: [],
      startNode: "",
      targetNode: "",
      accessible: false,
      shortestPath: null,
      searched: false,
    };
  },

  async mounted() {
    try {
      this.nodes = await $fetch("/api/node");
      this.connections = await $fetch("/api/connection");
      this.graph = createGraph(this.nodes, this.connections);
    } catch (e) {
      this.nodes = [];
      this.connections = [];
      this.graph = {};
    }
  },

  computed: {
    formattedGraph() {
      return JSON.stringify(this.graph, null, 2);
    },
  },

  methods: {
    runBFS() {
      this.graph = createGraph(this.nodes, this.connections);
      this.shortestPath = bfsShortestPath(
        this.graph,
        this.startNode.trim(),
        this.targetNode.trim(),
        this.accessible,
      );

      this.searched = true;
    },
    watchPath() {
      if (!this.shortestPath || !this.shortestPath.length) return;
      const path = this.shortestPath.join(",");
      this.$router.push({ path: "/watch-route", query: { path } });
    },
  },
};

</script>
