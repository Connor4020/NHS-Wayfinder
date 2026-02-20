// Comment here


// Main function.
export function bfsShortestPath(graph, start, target, wheelchairMode) {
  const startKey = String(start);
  const targetKey = String(target);

  if (!graph[startKey] || !graph[targetKey]) return null;

  const queue = [[startKey]];
  const visited = new Set([startKey]);

  while (queue.length > 0) {
    const path = queue.shift();
    const currentNode = path[path.length - 1];

    if (currentNode === targetKey) return path;

    for (let neighbor of graph[currentNode].neighbors) {
      if (wheelchairMode && neighbor.inaccessible) {
        continue;
      }

      const neighborId = String(neighbor.id);

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push([...path, neighborId]);
      }
    }
  }
  return null;
}