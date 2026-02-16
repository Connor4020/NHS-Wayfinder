<template>
  <div style="padding: 20px">
    <h2>Graph</h2>
    <p>
      A: { neighbors: ["B", "C"], accessible: true }, B: { neighbors: ["D",
      "E"], accessible: true }, C: { neighbors: ["F"], accessible: false }, D: {
      neighbors: [], accessible: true }, E: { neighbors: ["F"], accessible: true
      }, F: { neighbors: [], accessible: true },
    </p>

    <div>
      <label>Start Node:</label>
      <input v-model="startNode" />
    </div>

    <div>
      <label>Target Node:</label>
      <input v-model="targetNode" />
    </div>

    <div style="margin-top: 10px">
      <input type="checkbox" v-model="wheelchairMode" />
      <label>Wheelchair User</label>
    </div>

    <button style="margin-top: 10px" @click="runBFS">Find Shortest Path</button>

    <div v-if="shortestPath" style="margin-top: 20px">
      <strong>Shortest Path:</strong>
      {{ shortestPath.join(" → ") }}
    </div>

    <div v-else-if="searched" style="color: red">No valid path found.</div>
  </div>
</template>

<script>
<<<<<<< HEAD
import { graph, bfsShortestPath } from "@/../util/bfs.js";
=======
import { graph, bfsShortestPath } from "@/../util/bfs";
>>>>>>> 8ffd0ec1245893fb3e8c9f434bbeadcea6695cdd

export default {
  data() {
    return {
      startNode: "",
      targetNode: "",
      wheelchairMode: false,
      shortestPath: null,
      searched: false,
    };
  },

  computed: {
    formattedGraph() {
      return JSON.stringify(graph, null, 2);
    },
  },

  methods: {
    runBFS() {
      this.shortestPath = bfsShortestPath(
        graph,
        this.startNode.trim(),
        this.targetNode.trim(),
        this.wheelchairMode,
      );

      this.searched = true;
    },
  },
};
</script>
