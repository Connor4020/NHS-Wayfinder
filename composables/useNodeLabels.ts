import { computed, type ComputedRef, type Ref } from 'vue'

type NodeItem = {
  node_id: number | string
  node_name?: string
  name?: string
}

type NodeSource = Ref<NodeItem[] | null | undefined> | ComputedRef<NodeItem[] | null | undefined>

export default function useNodeLabels(nodesSource: NodeSource) {
  const nodesList = computed<NodeItem[]>(() => {
    const raw = nodesSource.value
    return Array.isArray(raw) ? raw : []
  })

  const nodeNameMap = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const node of nodesList.value) {
      const id = String(node.node_id)
      map[id] = node.node_name || node.name || id
    }
    return map
  })

  const nodeLabel = (nodeId: number | string) => {
    const key = String(nodeId)
    return nodeNameMap.value[key] || key
  }

  return {
    nodeNameMap,
    nodeLabel,
    nodesList,
  }
}
