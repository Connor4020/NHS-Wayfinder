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
      startInput: "",
      targetInput: "",
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
    locationLabel(node) {
      return `${node.node_name} (${node.node_id})`;
    },
    resolveNodeId(rawValue) {
      const normalized = String(rawValue || "").trim().toLowerCase();
      if (!normalized) return "";

      const byId = this.nodes.find(
        (n) => String(n.node_id).toLowerCase() === normalized,
      );
      if (byId) return String(byId.node_id);

      const byLabel = this.nodes.find(
        (n) => this.locationLabel(n).toLowerCase() === normalized,
      );
      if (byLabel) return String(byLabel.node_id);

      const exactNameMatches = this.nodes.filter(
        (n) => String(n.node_name || "").trim().toLowerCase() === normalized,
      );
      if (exactNameMatches.length === 1) {
        return String(exactNameMatches[0].node_id);
      }

      const startsWithMatch = this.nodes.find(
        (n) =>
          this.locationLabel(n).toLowerCase().startsWith(normalized) ||
          String(n.node_name || "").toLowerCase().startsWith(normalized),
      );
      return startsWithMatch ? String(startsWithMatch.node_id) : "";
    },
    runBFS() {
      const startNode = this.resolveNodeId(this.startInput);
      const targetNode = this.resolveNodeId(this.targetInput);

      if (!startNode || !targetNode) {
        this.shortestPath = null;
        this.searched = true;
        return;
      }
      this.graph = createGraph(this.nodes, this.connections);
      this.shortestPath = bfsShortestPath(
        this.graph,
        String(startNode),
        String(targetNode),
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
      <div class="pathfinder-form-wrap">
        <h2>Find your path:</h2>

        <div class="form-group">
          <label>Start location:</label>
          <input
            v-model="startInput"
            list="start-location-list"
            placeholder="Type start location"
          />
          <datalist id="start-location-list">
            <option v-for="n in nodes" :key="`start-${n.node_id}`" :value="locationLabel(n)" />
          </datalist>
        </div>

        <div class="form-group">
          <label>Target destination:</label>
          <input
            v-model="targetInput"
            list="target-location-list"
            placeholder="Type target destination"
          />
          <datalist id="target-location-list">
            <option v-for="n in nodes" :key="`target-${n.node_id}`" :value="locationLabel(n)" />
          </datalist>
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
