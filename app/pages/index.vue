<script>
import { user } from "~~/server/api/use-auth";

// <NuxtLink to="/admin/create-routemap">Create Route Map</NuxtLink>
// <NuxtLink to="/admin/edit-routemap">Edit Route Map</NuxtLink>
//     <NuxtLink to="/admin/create-route">Create Route</NuxtLink>
//       <NuxtLink to="/list-routes">View Routes</NuxtLink>

import { bfsShortestPath } from "@/../util/bfs";
import { createGraph } from "@/../util/graph";

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
      if (!this.startNode || !this.targetNode) {
        this.shortestPath = null;
        this.searched = true;
        return;
      }
      this.graph = createGraph(this.nodes, this.connections);
      this.shortestPath = bfsShortestPath(
        this.graph,
        String(this.startNode),
        String(this.targetNode),
        this.accessible,
      );

      this.searched = true;
      // If a valid path was found, route to the watch-route page
      if (this.shortestPath && this.shortestPath.length) {
        const path = this.shortestPath.join(",");
        this.$router.push({ path: "/watch-route", query: { path } });
      }
    },
    watchPath() {
      if (!this.shortestPath || !this.shortestPath.length) return;
      const path = this.shortestPath.join(",");
      this.$router.push({ path: "/watch-route", query: { path } });
    },
  },
};
</script>

<template>
  <div class="background-image">
    <div class="box-container">
      <h1 class="welcome-message">NHS</h1>
      <h1 class="welcome-message">Pathfinder</h1>
      <p class="hospital-name">Northern General Hospital</p>
    </div>

    <div class="box-container-center">
      <div style="padding: 20px">
        <h2>Find your path:</h2>

        <div class="form-group">
          <label style="color: #ffffff">Start location:</label>
          <select v-model="startNode">
            <option value="">-- Select start location --</option>
            <option
              v-for="n in nodes"
              :key="n.node_id"
              :value="String(n.node_id)"
            >
              {{ n.node_name }} ({{ n.node_id }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label style="color: #ffffff">Target destination:</label>
          <select v-model="targetNode">
            <option value="">-- Select target destination --</option>
            <option
              v-for="n in nodes"
              :key="n.node_id"
              :value="String(n.node_id)"
            >
              {{ n.node_name }} ({{ n.node_id }})
            </option>
          </select>
        </div>

        <div class="checkbox-group">
          <input type="checkbox" v-model="accessible" />
          <label>Wheelchair User</label>
        </div>

        <button @click="runBFS">Find Path</button>

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
          Pathfinding is subject to inaccuracies. If extra help is needed,
          please ask a member of staff.
        </p>
      </div>
    </div>
  </div>
</template>
