// Will be built dynamically asp.
export function createGraph() {
    return {
        A: { neighbors: ["B", "C"], accessible: true },
    B: { neighbors: ["D", "E"], accessible: true },
    C: { neighbors: ["F"], accessible: false },
    D: { neighbors: [], accessible: true },
    E: { neighbors: ["F"], accessible: true },
    F: { neighbors: [], accessible: true },
    }
}