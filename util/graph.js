// This file creates a graph that can then be put into the bfs.js file where it can work its magic on it.

export function createGraph(nodes, connections) {
    // Checks to see if nodes and connections are arrays before doing anything.
    if (!Array.isArray(nodes) || !Array.isArray(connections)) {
        return {};
    }

    // Create graph with nothing in it.
    // Built later.
    const graph = {};

    // Puts a node into the graph, attributing it's ID, name and a list of it's neighbors.
    nodes.forEach(node => {
        const nodeId = String(node.node_id).trim();
        graph[nodeId] = {
            id: nodeId,
            name: node.node_name,
            neighbors: []
        }; 
    });


    connections.forEach(connection => {
        // Gets to and from node for the connection and converts to string.
        const fromNodeId = String(connection.node_1).trim();
        const toNodeId   = String(connection.node_2).trim();

        // Checks to see there exists a to and from node.
        if (!graph[fromId] || !graph[toId]) {
            return;
        }


        let isAccessible = true;

        // If there's a value in wheelchair_accessible then set it to true.
        if (connection.wheelchair_accessible !== undefined &&
            connection.wheelchair_accessible !== null) {
            isAccessible = Number(connection.wheelchair_accessible) === 1;
        }

        // Reverses cos of QOL reasons.
        const isInaccessible = !isAccessible;

        graph[fromId].neighbors.push({
            id: toId,
            inaccessible: isInaccessible
        });
        // ^
        // |
        // Adds each other as a neighbour and the accessability value.
        // |
        // V
        graph[toId].neighbors.push({
            id: fromId,
            inaccessible: isInaccessible
        });
    });

    return graph;
}