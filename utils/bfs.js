export const graph = {
  A: { neighbors: ["B", "C"], accessible: true },
  B: { neighbors: ["D", "E"], accessible: true },
  C: { neighbors: ["F"], accessible: false },
  D: { neighbors: [], accessible: true },
  E: { neighbors: ["F"], accessible: true },
  F: { neighbors: [], accessible: true },
};

/**
 * @param {Object} graph
 * @param {String} start
 * @param {String} target
 * @param {Boolean} wheelchairMode
 */
export function bfsShortestPath(graph, start, target, wheelchairMode) {
  if (!graph[start] || !graph[target]) return null;

  const queue = [[start]];
  const visited = new Set([start]);

  while (queue.length > 0) {
    const path = queue.shift();
    const currentNode = path[path.length - 1];

    if (currentNode === target) return path;

    for (let neighbor of graph[currentNode].neighbors) {
      const nodeData = graph[neighbor];

      if (wheelchairMode && !nodeData.accessible) {
        continue;
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return null;
}
