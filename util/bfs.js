// Comment here


// Main function.
export function bfsShortestPath(nodeGraph, startNode, targetNode, isWheelchairMode) {
  // Converts start and target node into a string.
  const startKey = String(startNode);
  const targetKey = String(targetNode);

  // Checks the inputted nodes to see they exist.
  if (!nodeGraph[startKey] || !nodeGraph[targetKey]) return null;

  // Queue is where the explored nodes that want to be visited go.
  const queue = [[startKey]];
  // Nodes that are visited go.
  const visited = new Set([startKey]);

  // Condition to go if there's still nodes in the queue.
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